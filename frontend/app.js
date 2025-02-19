// API Base URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const registerForm = document.getElementById('registerForm');

// Toggle between login and register forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-form').classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    document.querySelector('.auth-form').classList.remove('hidden');
});

// Handle Login
// Remove these debug lines
// In the login handler, update this part
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            
            // If it's a student, we need to get their student profile first
            if (data.role === 'student') {
                const studentResponse = await fetch(`${API_URL}/students/user/${data._id}`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });
                const studentData = await studentResponse.json();
                localStorage.setItem('userId', studentData._id); // Store student ID
                localStorage.setItem('userAccountId', data._id); // Store user account ID
            } else {
                localStorage.setItem('userId', data._id);
            }
            
            showDashboard(data.role);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
    }
});

// Handle Register
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('role').value;

    try {
        const userResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const userData = await userResponse.json();

        if (userResponse.ok) {
            showSuccess('Registration successful! Please login.');
            registerForm.classList.add('hidden');
            document.querySelector('.auth-form').classList.remove('hidden');
        } else {
            showError(userData.message);
        }
    } catch (error) {
        showError('Connection error. Please try again.');
    }
});

// Show Dashboard based on role
function showDashboard(role) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');

    if (role === 'trainer') {
        loadTrainerDashboard();
    } else {
        loadStudentDashboard();
    }
}

// Load Trainer Dashboard
async function loadTrainerDashboard() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        
        // In the loadTrainerDashboard function, update the header section
        dashboard.innerHTML = `
            <div class="trainer-dashboard">
                <header class="dashboard-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h2>${localStorage.getItem('userName')} <span class="dashboard-text">Dashboard</span></h2>
                        </div>
                        <div class="header-actions">
                            <button onclick="showAddStudentForm()" class="primary-btn">
                                <i class="fas fa-user-plus"></i> Add New Student
                            </button>
                            <button onclick="logout()" class="secondary-btn">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <section class="students-section">
                    <h3>Your Students</h3>
                    <div class="students-grid">
                        ${students.length === 0 
                            ? '<div class="no-students"><p>No students found. Add students using the button above.</p></div>'
                            : students.map(student => `
                                <div class="student-card">
                                    <div class="student-header">
                                        <h4>${student.user ? student.user.name : 'Unknown Student'}</h4>
                                    </div>
                                    <div class="student-info">
                                        <div class="info-item">
                                            <span class="label">Age:</span>
                                            <span class="value">${student.age || 'N/A'}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="label">Weight:</span>
                                            <span class="value">${student.weight || 'N/A'} kg</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="label">Height:</span>
                                            <span class="value">${student.height || 'N/A'} cm</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="label">Medical:</span>
                                            <span class="value">${student.medicalRestrictions || 'None'}</span>
                                        </div>
                                    </div>
                                    <div class="student-actions">
                                        <button onclick="viewWorkouts('${student._id}')" class="primary-btn">
                                            <i class="fas fa-dumbbell"></i> View Workouts
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </section>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Error loading dashboard. Please try again.');
    }
}

// Add new function to show student form
function showAddStudentForm() {
    // Remove existing modal if it exists
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // First fetch available students
    fetch(`${API_URL}/users/students`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(availableStudents => {
        const formHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h3>Add New Student</h3>
                    <form id="addStudentForm">
                        <div class="form-group">
                            <label for="studentId">Select Student:</label>
                            <select id="studentId" required>
                                <option value="">Select a student...</option>
                                ${availableStudents.map(student => 
                                    `<option value="${student._id}">${student.name} (${student.email})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="studentAge">Age:</label>
                            <input type="number" id="studentAge" required>
                        </div>
                        <div class="form-group">
                            <label for="studentWeight">Weight (kg):</label>
                            <input type="number" id="studentWeight" required>
                        </div>
                        <div class="form-group">
                            <label for="studentHeight">Height (cm):</label>
                            <input type="number" id="studentHeight" required>
                        </div>
                        <div class="form-group">
                            <label for="studentMedical">Medical Restrictions:</label>
                            <textarea id="studentMedical"></textarea>
                        </div>
                        <button type="submit">Add Student</button>
                        <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
                    </form>
                </div>
            </div>
        `;

        dashboard.insertAdjacentHTML('beforeend', formHTML);
        document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    })
    .catch(error => {
        showError('Error loading available students');
    });
}

// Add new function to handle student addition
async function handleAddStudent(e) {
    e.preventDefault();
    try {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                user: document.getElementById('studentId').value,
                age: document.getElementById('studentAge').value,
                weight: document.getElementById('studentWeight').value,
                height: document.getElementById('studentHeight').value,
                medicalRestrictions: document.getElementById('studentMedical').value || 'None'
            })
        });

        if (response.ok) {
            showSuccess('Student added successfully');
            e.target.closest('.modal').remove();
            loadTrainerDashboard();
        } else {
            const data = await response.json();
            showError(data.message);
        }
    } catch (error) {
        showError('Error adding student');
    }
}

// Load Student Dashboard
async function loadStudentDashboard() {
    try {
        // First get the student profile using user ID
        const userAccountId = localStorage.getItem('userAccountId');
        const studentResponse = await fetch(`${API_URL}/students/user/${userAccountId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (studentResponse.status === 404) {
            // Student profile doesn't exist yet
            dashboard.innerHTML = `
                <div class="student-pending">
                    <header class="dashboard-header">
                        <div class="header-content">
                            <div class="header-title">
                                <h2>Welcome ${localStorage.getItem('userName')}</h2>
                            </div>
                            <div class="header-actions">
                                <button onclick="logout()" class="secondary-btn">
                                    <i class="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    </header>
                    <div class="pending-message">
                        <i class="fas fa-clock"></i>
                        <h3>Profile Setup Pending</h3>
                        <p>Your trainer needs to complete your profile setup before you can access your workouts.</p>
                        <p>Please contact your trainer to finish the registration process.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (!studentResponse.ok) {
            throw new Error('Failed to fetch student profile');
        }

        const studentData = await studentResponse.json();
        console.log('Student data:', studentData); // Debug line

        // Store the student ID
        localStorage.setItem('studentId', studentData._id);

        // Then get workouts using student ID
        const workoutsResponse = await fetch(`${API_URL}/workouts/student/${studentData._id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!workoutsResponse.ok) {
            throw new Error('Failed to fetch workouts');
        }

        const workoutsData = await workoutsResponse.json();
        console.log('Workouts data:', workoutsData); // Debug line

        // Inside loadStudentDashboard function
        dashboard.innerHTML = `
            <h2>Student Dashboard</h2>
            <button onclick="logout()">Logout</button>
            <h3>Your Workouts</h3>
            <div class="workouts-list">
                ${!workoutsData.workouts || workoutsData.workouts.length === 0 
                    ? '<p>No workouts assigned yet. Contact your trainer.</p>'
                    : workoutsData.workouts.map(workout => `
                        <div class="workout-card">
                            <h4>${workout.focus || 'Untitled Workout'}</h4>
                            <p>Day: ${getDayName(workout.weekDay)}</p>
                            <div class="exercises">
                                ${workout.exercises && workout.exercises.map(exercise => `
                                    <div class="exercise-item">
                                        <p><strong>${exercise.name}</strong></p>
                                        <p>Sets: ${exercise.sets} | Reps: ${exercise.reps}</p>
                                        ${exercise.weight ? `<p>Weight: ${exercise.weight}kg</p>` : ''}
                                        ${exercise.notes ? `<p>Notes: ${exercise.notes}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading student dashboard:', error);
        showError(`Error loading dashboard: ${error.message}`);
    }
}

// Add this function to handle viewing workouts
async function viewWorkouts(studentId) {
    try {
        console.log('Fetching workouts for student:', studentId);
        const response = await fetch(`${API_URL}/workouts/student/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load workouts');
        }

        const data = await response.json();
        console.log('Workouts data:', data); // Debug line

        // Na função viewWorkouts, atualize o cabeçalho
        dashboard.innerHTML = `
            <div class="workouts-dashboard">
                <header class="dashboard-header">
                    <div class="header-content">
                        <div class="header-title">
                            <div class="header-title">
                                <h2>Student Workouts <span class="dashboard-text">Training Plan</span></h2>
                            </div>
                            <div class="header-actions">
                                <button onclick="showAddWorkoutForm('${studentId}')" class="primary-btn">
                                    <i class="fas fa-plus"></i> Add New Workout
                                </button>
                                <button onclick="loadTrainerDashboard()" class="secondary-btn">
                                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                                </button>
                            </div>
                        </header>
        
                        <div class="workouts-container">
                            ${!data.workouts || data.workouts.length === 0 
                                ? '<div class="no-workouts"><p>No workouts found. Add a new workout plan.</p></div>'
                                : data.workouts.map(workout => `
                                    <div class="workout-card">
                                        <div class="workout-header">
                                            <h3>${workout.focus || 'Untitled Workout'}</h3>
                                            <div class="workout-actions">
                                                <button onclick="editWorkout('${workout._id}')" class="action-btn edit-btn">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                <button onclick="deleteWorkout('${workout._id}')" class="action-btn delete-btn">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p>Day: ${getDayName(workout.weekDay)}</p>
                                        <div class="exercises">
                                            ${workout.exercises && workout.exercises.map(exercise => `
                                                <div class="exercise-item">
                                                    <p><strong>${exercise.name}</strong></p>
                                                    <p>Sets: ${exercise.sets} | Reps: ${exercise.reps}</p>
                                                    ${exercise.weight ? `<p>Weight: ${exercise.weight}kg</p>` : ''}
                                                    ${exercise.notes ? `<p>Notes: ${exercise.notes}</p>` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                `;
    } catch (error) {
        console.error('Error loading workouts:', error);
        showError(`Error loading workouts: ${error.message}`);
    }
}

// Add this helper function to convert weekDay number to name
function getDayName(weekDay) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[weekDay - 1] || 'Unknown';
}

// Add this function to show the workout form
function showAddWorkoutForm(studentId) {
    const formHTML = `
        <div class="modal">
            <div class="modal-content">
                <h3>Add New Workout</h3>
                <form id="addWorkoutForm">
                    <div class="form-group">
                        <label for="weekDay">Day of Week:</label>
                        <select id="weekDay" required>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                            <option value="7">Sunday</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="focus">Workout Focus:</label>
                        <input type="text" id="focus" required placeholder="e.g., Upper Body, Legs, etc.">
                    </div>
                    <div id="exercises">
                        <h4>Exercises</h4>
                        <div class="exercise-inputs">
                            <input type="text" placeholder="Exercise name" required>
                            <input type="number" placeholder="Sets" required>
                            <input type="number" placeholder="Reps" required>
                            <input type="number" placeholder="Weight (kg)">
                            <input type="text" placeholder="Notes">
                        </div>
                    </div>
                    <button type="button" onclick="addExerciseInput()">Add Another Exercise</button>
                    <button type="submit">Save Workout</button>
                    <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    dashboard.insertAdjacentHTML('beforeend', formHTML);
    document.getElementById('addWorkoutForm').addEventListener('submit', (e) => handleAddWorkout(e, studentId));
}

// Add this function to handle adding more exercise inputs
function addExerciseInput() {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-inputs';
    exerciseDiv.innerHTML = `
        <input type="text" placeholder="Exercise name" required>
        <input type="number" placeholder="Sets" required>
        <input type="number" placeholder="Reps" required>
        <input type="number" placeholder="Weight (optional)">
        <input type="text" placeholder="Notes (optional)">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    document.getElementById('exercises').appendChild(exerciseDiv);
}

// Add this function to handle workout submission
async function handleAddWorkout(e, studentId) {
    e.preventDefault();
    const exerciseInputs = document.getElementsByClassName('exercise-inputs');
    const exercises = Array.from(exerciseInputs).map(div => ({
        name: div.children[0].value,
        sets: parseInt(div.children[1].value),
        reps: parseInt(div.children[2].value),
        weight: div.children[3].value ? parseInt(div.children[3].value) : undefined,
        notes: div.children[4].value || undefined
    }));

    try {
        console.log('Sending workout data:', { // Debug line
            student: studentId,
            weekDay: parseInt(document.getElementById('weekDay').value),
            focus: document.getElementById('focus').value,
            exercises: exercises
        });

        const response = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                student: studentId,
                weekDay: parseInt(document.getElementById('weekDay').value),
                focus: document.getElementById('focus').value,
                exercises: exercises
            })
        });

        const savedWorkout = await response.json();
        console.log('Saved workout:', savedWorkout); // Debug line

        if (response.ok) {
            showSuccess('Workout added successfully');
            e.target.closest('.modal').remove();
            await viewWorkouts(studentId); // Make sure to await this
        } else {
            throw new Error(savedWorkout.message || 'Failed to save workout');
        }
    } catch (error) {
        console.error('Error saving workout:', error);
        showError(`Error saving workout: ${error.message}`);
    }
}

// Add this function to handle workout editing
async function editWorkout(workoutId) {
    try {
        // Fetch the workout data first
        const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workout details');
        }

        const workout = await response.json();

        const formHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h3>Edit Workout</h3>
                    <form id="editWorkoutForm">
                        <div class="form-group">
                            <label for="weekDay">Day of Week:</label>
                            <select id="weekDay" required>
                                <option value="1" ${workout.weekDay === 1 ? 'selected' : ''}>Monday</option>
                                <option value="2" ${workout.weekDay === 2 ? 'selected' : ''}>Tuesday</option>
                                <option value="3" ${workout.weekDay === 3 ? 'selected' : ''}>Wednesday</option>
                                <option value="4" ${workout.weekDay === 4 ? 'selected' : ''}>Thursday</option>
                                <option value="5" ${workout.weekDay === 5 ? 'selected' : ''}>Friday</option>
                                <option value="6" ${workout.weekDay === 6 ? 'selected' : ''}>Saturday</option>
                                <option value="7" ${workout.weekDay === 7 ? 'selected' : ''}>Sunday</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="focus">Workout Focus:</label>
                            <input type="text" id="focus" required value="${workout.focus || ''}" placeholder="e.g., Upper Body, Legs, etc.">
                        </div>
                        <div id="exercises">
                            <h4>Exercises</h4>
                            ${workout.exercises.map(exercise => `
                                <div class="exercise-inputs">
                                    <input type="text" placeholder="Exercise name" required value="${exercise.name}">
                                    <input type="number" placeholder="Sets" required value="${exercise.sets}">
                                    <input type="number" placeholder="Reps" required value="${exercise.reps}">
                                    <input type="number" placeholder="Weight (kg)" value="${exercise.weight || ''}">
                                    <input type="text" placeholder="Notes" value="${exercise.notes || ''}">
                                    <button type="button" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="addExerciseInput()">Add Another Exercise</button>
                        <button type="submit">Save Changes</button>
                        <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
                    </form>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            existingModal.remove();
        }

        dashboard.insertAdjacentHTML('beforeend', formHTML);

        // Add submit handler
        document.getElementById('editWorkoutForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const exerciseInputs = document.getElementsByClassName('exercise-inputs');
            const exercises = Array.from(exerciseInputs).map(div => ({
                name: div.children[0].value,
                sets: parseInt(div.children[1].value),
                reps: parseInt(div.children[2].value),
                weight: div.children[3].value ? parseInt(div.children[3].value) : undefined,
                notes: div.children[4].value || undefined
            }));

            try {
                const updateResponse = await fetch(`${API_URL}/workouts/${workoutId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        weekDay: parseInt(document.getElementById('weekDay').value),
                        focus: document.getElementById('focus').value,
                        exercises: exercises
                    })
                });

                if (updateResponse.ok) {
                    showSuccess('Workout updated successfully');
                    e.target.closest('.modal').remove();
                    viewWorkouts(workout.student); // Refresh the workouts list
                } else {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || 'Failed to update workout');
                }
            } catch (error) {
                showError(`Error updating workout: ${error.message}`);
            }
        });

    } catch (error) {
        console.error('Error in edit workout:', error);
        showError(`Error loading workout details: ${error.message}`);
    }
}

// Add this function to handle workout deletion
async function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            // Get the student ID before deleting the workout
            const workoutResponse = await fetch(`${API_URL}/workouts/${workoutId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const workoutData = await workoutResponse.json();
            const studentId = workoutData.student;

            // Delete the workout
            const deleteResponse = await fetch(`${API_URL}/workouts/${workoutId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json();
                throw new Error(errorData.message || 'Failed to delete workout');
            }

            showSuccess('Workout deleted successfully');
            // Refresh the workouts list with the student ID we got earlier
            await viewWorkouts(studentId);
        } catch (error) {
            console.error('Error deleting workout:', error);
            showError(`Error deleting workout: ${error.message}`);
        }
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, authContainer);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.container').insertBefore(successDiv, authContainer);
    setTimeout(() => successDiv.remove(), 3000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    dashboard.classList.add('hidden');
    authContainer.classList.remove('hidden');
}

// Check if user is already logged in
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');
if (token && userRole) {
    showDashboard(userRole);
}
// here we will write the shared functions for the project

// function to check if the user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// function to get the user data
function getUserData() {
    return JSON.parse(localStorage.getItem('userData'));
}

// function to set the user data
function setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// function to clear the user data
function clearUserData() {
    localStorage.removeItem('userData');
}

// function to logout the user
function logout() {
    clearUserData(); localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// function to get the token
function getToken() {
    return localStorage.getItem('token');
}

// function to set the token
function setToken(token) {
    localStorage.setItem('token', token);
}

// function to save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// function to load data from localStorage
function loadData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

//
// function to get the current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}
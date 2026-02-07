// Forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotForm = document.getElementById('forgotForm');

// Switch buttons
document.getElementById('showSignup').addEventListener('click', () => switchForm('signup'));
document.getElementById('showLogin').addEventListener('click', () => switchForm('login'));
document.getElementById('showForgot').addEventListener('click', () => switchForm('forgot'));
document.getElementById('backLogin').addEventListener('click', () => switchForm('login'));

// LocalStorage user database
let users = JSON.parse(localStorage.getItem('users')) || {};

// Remember Me
if(localStorage.getItem('rememberedEmail')) {
  loginForm.loginEmail.value = localStorage.getItem('rememberedEmail');
  loginForm.loginPassword.value = localStorage.getItem('rememberedPassword');
  loginForm.rememberMe.checked = true;
}

// Switch forms
function switchForm(form) {
  loginForm.classList.remove('active');
  signupForm.classList.remove('active');
  forgotForm.classList.remove('active');

  if(form === 'login') loginForm.classList.add('active');
  if(form === 'signup') signupForm.classList.add('active');
  if(form === 'forgot') forgotForm.classList.add('active');
}

// LOGIN
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = loginForm.loginEmail.value;
  const password = loginForm.loginPassword.value;

  if(users[email] && users[email] === password) {
    alert('Login Successful!');
    if(loginForm.rememberMe.checked) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }
    loginForm.reset();
  } else {
    alert('User not found or incorrect password!');
  }
});

// SIGNUP
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = signupForm.signupEmail.value;
  const password = signupForm.signupPassword.value;

  if(users[email]) {
    alert('User already exists!');
  } else {
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign Up Successful! Please login.');
    signupForm.reset();
    switchForm('login');
  }
});

// FORGOT PASSWORD
forgotForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = forgotForm.forgotEmail.value;
  const newPassword = forgotForm.newPassword.value;

  if(users[email]) {
    users[email] = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password Updated! Please login.');
    forgotForm.reset();
    switchForm('login');
  } else {
    alert('Email not found!');
  }
});
const showHide = document.querySelectorAll('.show-hide');
showHide.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling; // get input
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  });
});
// Password show/hide functionality
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('loginPassword');

togglePassword.addEventListener('click', () => {
  if(passwordInput.type === 'password'){
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
});

// Login button functionality
const loginBtn = document.querySelector('.btn'); // Login button
const loginEmail = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');

loginBtn.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent form submission

  const email = loginEmail.value.trim();
  const password = loginPasswordInput.value.trim();

  if(email === "" || password === ""){
    alert("Please enter both email and password!");
    return;
  }

  // You can also validate email format here if you want

  // If valid → redirect to index.html
  window.location.href = "index.html";
});

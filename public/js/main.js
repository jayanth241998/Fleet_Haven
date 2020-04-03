$(document).ready(function () {
	let currentPathname = window.location.pathname;

	if (currentPathname == "") {
		$("#homePageHeader").addClass("active");
	} else if (currentPathname == "/drivers") {
		$("#driversPageHeader").addClass("active");
		$("#driversMenu").addClass("in");
		$("#driversTab").addClass("active");
	} else if (currentPathname == "/drivers/create") {
		$("#addDriverHeader").addClass("active");
		$("#driversMenu").addClass("in");
		$("#driversTab").addClass("active");
	} else if (currentPathname == "/vehicles") {
		$("#vehiclesPageHeader").addClass("active");
		$("#vehiclesMenu").addClass("in");
		$("#vehiclesTab").addClass("active");
	} else if (currentPathname == "/vehicles/trips") {
		$("#allTripsHeader").addClass("active");
		$("#vehiclesMenu").addClass("in");
		$("#vehiclesTab").addClass("active");
	} else if (currentPathname == "/vehicles/create") {
		$("#addVehicleHeader").addClass("active");
		$("#vehiclesMenu").addClass("in");
		$("#vehiclesTab").addClass("active");
	} else if (currentPathname == "/vehicles/trips/create") {
		$("#addTripHeader").addClass("active");
		$("#vehiclesMenu").addClass("in");
		$("#vehiclesTab").addClass("active");
	} else if (currentPathname == "/reports") {
		$("#reportsPageHeader").addClass("active");
		$("#reportsMenu").addClass("in");
		$("#reportsTab").addClass("active");
	} else if (currentPathname == "/users/login") {
		$("#login").addClass("active");
	} else if (currentPathname == "/users/register") {
		$("#register").addClass("active");
	} else if (currentPathname == "/contact") {
		$("#contact").addClass("active");
	}

	/*
	 * Validation for Registration and Account recovery forms
	*/
	function validateForm(registerName, registerEmail) {
		let letter = document.getElementById("letter");
		let capital = document.getElementById("capital");
		let number = document.getElementById("number");
		let symbol = document.getElementById("symbol");
		let length = document.getElementById("length");
		let registerMessage = document.getElementById("registerMessage");
		let passwordsNoMatch = document.getElementById("passwordsNoMatch");
		let registerPassword = $("#registerPassword");
		let registerPassword2 = $("#registerPassword2");
		let registerUsername = $("#registerUsername");
		let registerSubmitButton = document.getElementById("registerSubmitButton");

		function checkRegistrationFormValidity() {
			if (registerUsername[0].validity.valid && registerPassword[0].validity.valid &&
				registerPassword2[0].validity.valid && registerPassword[0].value === registerPassword2[0].value) {
				if (registerName && registerEmail) {
					if (registerName[0].validity.valid && registerEmail[0].validity.valid) {
						registerSubmitButton.disabled = false;
					} else {
						registerSubmitButton.disabled = true;
					}
				} else {
					registerSubmitButton.disabled = false;
				}
			} else {
				registerSubmitButton.disabled = true;
			}
		}

		$('#registerPassword').password({
			shortPass: 'The password is too short 🕵️‍',
			badPass: 'Weak; try combining letters, numbers and symbols 🤨',
			goodPass: 'Medium; still needs improvement! 👨‍💻',
			strongPass: 'That\'s quite a strong password 🙃',
			containsField: 'The password contains your username',
			enterPass: 'Type your password',
			showPercent: false,
			showText: true, // shows the text tips
			animate: true, // whether or not to animate the progress bar on input blur/focus
			animateSpeed: 'fast', // the above animation speed
			field: false, // select the match field (selector or jQuery instance) for better password checks
			fieldPartialMatch: true, // whether to check for partials in field
			minimumLength: 8 // minimum password length (below this threshold, the score is 0)
		});

		// $('#password').on('password.score', (e, score) => {
		// 	console.log('Called every time a new score is calculated (this means on every keyup)')
		// 	console.log('Current score is %d', score)
		// })

		// $('#password').on('password.text', (e, text, score) => {
		// 	console.log('Called every time the text is changed (less updated than password.score)')
		// 	console.log('Current message is %s with a score of %d', text, score)
		// })

		if (registerName && registerEmail) {
			registerName.keyup(function () {
				checkRegistrationFormValidity();
			});

			registerEmail.keyup(function () {
				checkRegistrationFormValidity();
			});
		}
		registerUsername.keyup(function () {
			checkRegistrationFormValidity();
		});

		registerPassword.focus(function () {
			registerMessage.style.display = "block";
		});

		// When the user clicks outside of the password field, hide the message box
		// registerPassword.blur(function () {
		// 	registerMessage.style.display = "none";
		// });

		// When the user starts to type something inside the password field
		registerPassword.keyup(function () {
			checkRegistrationFormValidity();
			registerMessage.style.display = "block";

			// Validate lowercase letters
			let lowerCaseLetters = /[a-z]/g;
			if (registerPassword[0].value.match(lowerCaseLetters)) {
				letter.classList.remove("invalid");
				letter.classList.add("valid");
			} else {
				letter.classList.remove("valid");
				letter.classList.add("invalid");
			}

			// Validate capital letters
			let upperCaseLetters = /[A-Z]/g;
			if (registerPassword[0].value.match(upperCaseLetters)) {
				capital.classList.remove("invalid");
				capital.classList.add("valid");
			} else {
				capital.classList.remove("valid");
				capital.classList.add("invalid");
			}

			// Validate numbers
			let numbers = /[0-9]/g;
			if (registerPassword[0].value.match(numbers)) {
				number.classList.remove("invalid");
				number.classList.add("valid");
			} else {
				number.classList.remove("valid");
				number.classList.add("invalid");
			}

			// Validate symbols
			let symbols = /[$@!%*?&#^_-]/g;
			if (registerPassword[0].value.match(symbols)) {
				symbol.classList.remove("invalid");
				symbol.classList.add("valid");
			} else {
				symbol.classList.remove("valid");
				symbol.classList.add("invalid");
			}

			// Validate length
			if (registerPassword[0].value.length >= 8 && registerPassword[0].value.length <= 30) {
				length.classList.remove("invalid");
				length.classList.add("valid");
			} else {
				length.classList.remove("valid");
				length.classList.add("invalid");
			}

			if (registerPassword[0].value && registerPassword[0].value === registerPassword2[0].value) {
				passwordsNoMatch.classList.remove("invalid");
				passwordsNoMatch.classList.add("valid");
			} else {
				passwordsNoMatch.classList.remove("valid");
				passwordsNoMatch.classList.add("invalid");
			}
		});

		registerPassword2.focus(function () {
			registerMessage.style.display = "block";
		});

		// registerPassword2.blur(function () {
		// 	registerMessage.style.display = "none";
		// });

		registerPassword2.keyup(function () {
			checkRegistrationFormValidity();
			registerMessage.style.display = "block";

			if (registerPassword[0].value && registerPassword[0].value === registerPassword2[0].value) {
				passwordsNoMatch.classList.remove("invalid");
				passwordsNoMatch.classList.add("valid");
			} else {
				passwordsNoMatch.classList.remove("valid");
				passwordsNoMatch.classList.add("invalid");
			}
		});
	}

	if (currentPathname == "/users/register") {
		validateForm($("#registerName"), $("#registerEmail"));
	}

	if (currentPathname.includes("/users/recover-account")) {
		validateForm();
	}

	if (currentPathname == "/users/login") {
		document.getElementById("forgotPassword").onclick = function () {
			$('#forgotPasswordModal').modal("show");
		}
		// $('#forgotPasswordModal').on('shown.bs.modal', function () {
		// 	// do something
		// });
	}


	// Block inspect tools
	// document.onkeydown = function (e) {
	// 	if (event.keyCode == 123) { // block F12
	// 		return false;
	// 	}
	// 	if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
	// 		return false;
	// 	}
	// 	if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
	// 		return false;
	// 	}
	// 	if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
	// 		return false;
	// 	}
	// 	if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
	// 		return false;
	// 	}
	// }

	// Block right click
	// $(document).bind("contextmenu", function (e) {
	// 	e.preventDefault();
	// });
});

console.log("HI");

function validate_form() {
    let username = document.forms["form1"]["username"].value;
	let password = document.forms["form1"]["password"].value;

	console.log('Username: ' + username);
	console.log('Passwort: ' + password);

	if (username.search(" ") != -1) { return false; }
	if (password.search(" ") != -1) { return false; }

	console.log("Alles subbi 🥳");
}
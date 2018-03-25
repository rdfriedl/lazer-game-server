$(document).ready(function() {
	try {
		var forms = document.getElementsByTagName("form");
		for (var i = 0; i < forms.length; i++) {
			var form = forms[i];
			form.addEventListener("submit", function(event) {
				var form = event.target;
				var inputs = form.getElementsByTagName("input");
				for (var k = 0; k < inputs.length; k++) {
					var input = inputs[k];
					var value = input.type === "checkbox" ? input.checked : input.value;
					if (input.getAttribute("name") && !input.hasAttribute("data-keep") && !value) input.setAttribute("name", "");
				}
			});
		}
	} catch (err) {}
});

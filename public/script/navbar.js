// navbar & Footer
document.addEventListener("DOMContentLoaded", function () {
  fetch("/navbar")
    .then((response) => response.text())
    .then((navbarHTML) => {
      document.getElementById("navbar-section").innerHTML = navbarHTML;
    });
});

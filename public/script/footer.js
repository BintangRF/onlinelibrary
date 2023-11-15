// navbar & Footer
document.addEventListener("DOMContentLoaded", function () {
  fetch("/footer")
    .then((response) => response.text())
    .then((footerHTML) => {
      document.getElementById("footer-section").innerHTML = footerHTML;
    });
});

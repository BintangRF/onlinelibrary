$(document).ready(function () {
  $(".owl-carousel").owlCarousel({
    margin: 20,
    responsiveClass: true,
    autoHeight: true,
    smartSpeed: 800,
    nav: true,
    responsive: {
      0: {
        items: 3,
      },

      600: {
        items: 3,
      },

      1024: {
        items: 4,
      },

      1366: {
        items: 6,
      },
    },
  });
});

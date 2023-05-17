console.log = () => {};

$(document).ready(function () {
    $(".accordion-header").click(function () {
        $(this).toggleClass("collapsed");
        $(this).toggleClass("show hide");
        $(this).next(".collapse").toggleClass("show hide");
        const expanded = $(this).attr("aria-expanded");
        $(this).attr("aria-expanded", !expanded);
    });
});

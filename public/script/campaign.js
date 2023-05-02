const token = localStorage.getItem("jwtToken");

$(document).ready(function () {
    $(".channel").select2();
    $(".segment").select2();
});

// trigger-based element
$(document).ready(function () {
    $(".webpush-editor, .email-editor").hide();
    $(".end-time-type").hide();
});

// show page based on channel
$("#channel").on("change", function () {
    let cellValue = $(this).val();

    if (cellValue === "edm") {
        $(".email-editor").show();
        $(".webpush-editor").hide();
        $(".webpush-editor").val("");
    } else if (cellValue === "webpush") {
        $(".webpush-editor").show();
        $(".email-editor").hide();
        $(".email-editor").val("");
    } else {
        $(".webpush-editor").hide();
        $(".email-editor").hide();
    }
});

// show end date if not one-time delivery
$("#periodic-delivery").on("click", function () {
    $("#repeat-options").show();
    $(".end-time-type").show();
});
$("#one-time-delivery").on("click", function () {
    $("#repeat-options").hide();
    $(".end-time-type").hide();
});

// render segments
$.get({
    url: `/api/1.0/segments/names`,
    success: function (body) {
        $.each(body.data, function (idx) {
            const seg = body.data[idx];
            const option = $("<option></option>").attr("value", seg._id).text(seg.name);
            $("#segment").append(option);
        });
    },
    error: function (e) {
        console.error("ERROR:", e);
    },
});

// quill editor handler
(function () {
    "use strict";

    Quill.prototype.getHtml = function () {
        // console.log(this.container.querySelector(".ql-editor").innerHTML);
        return this.container.querySelector(".ql-editor").innerHTML;
    };

    let quillEd_1 = new Quill("#editor_1", {
        modules: { toolbar: "#toolbar_1" },
        theme: "snow",
    });

    let quillEd_txtArea_1 = document.createElement("textarea");
    let attrQuillTxtArea = document.createAttribute("quill__html");
    quillEd_txtArea_1.setAttributeNode(attrQuillTxtArea);

    let quillCustomDiv = quillEd_1.addContainer("ql-custom");
    quillCustomDiv.appendChild(quillEd_txtArea_1);

    let quillsHtmlBtns = document.querySelectorAll(".ql-html");
    for (let i = 0; i < quillsHtmlBtns.length; i++) {
        quillsHtmlBtns[i].addEventListener("click", function (evt) {
            let wasActiveTxtArea_1 = quillEd_txtArea_1.getAttribute("quill__html").indexOf("-active-") > -1;

            if (wasActiveTxtArea_1) {
                //html editor to quill
                quillEd_1.pasteHTML(quillEd_txtArea_1.value);
                evt.target.classList.remove("ql-active");
            } else {
                //quill to html editor
                quillEd_txtArea_1.value = quillEd_1.getHtml();
                evt.target.classList.add("ql-active");
            }

            quillEd_txtArea_1.setAttribute("quill__html", wasActiveTxtArea_1 ? "" : "-active-");
        });
    }
})();

// gallery image upload handler
$(document).ready(function () {
    const imageForm = $("#imageForm");
    const imageInput = $("#imageInput");
    const gallery = $("#image-container");

    imageForm.on("submit", async function (event) {
        event.preventDefault();
        console.log("submit event triggered");
        const file = imageInput[0].files[0];

        if (!file) {
            Toast.fire({
                icon: "error",
                title: `Error!`,
                text: `Please upload one image`,
            });
            return;
        }

        // get presigned url from backend server
        let url;
        try {
            const response = await axios("/api/1.0/campaigns/s3Url");
            url = response.data.url;
            console.log("get presigned url", url);
        } catch (e) {
            console.log(e);
            return;
        }

        // post the image direclty to the s3 bucket
        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "multipart/form-data",
            },
            body: file,
        });

        const imageUrl = url.split("?")[0];
        console.log(imageUrl);

        const imgDiv = $("<div>");
        imgDiv.addClass("image");
        imgDiv.html(`
            <img src=${imageUrl}>
            <div class="transparent-box">
                <p class="opacity-low">Click to copy Url</p>
            </div>
        `);

        // Add new image to the beginning of the gallery
        $("#image-container").prepend(imgDiv);
        Toast.fire({
            icon: "success",
            title: `Success!`,
            text: `Image uploaded!`,
        });
        // register event
        attachClickEvent();
    });
});

function attachClickEvent() {
    // attach click event listener to images
    $(".image").on("click", function () {
        const copyText = $(this).find("img").attr("src");
        navigator.clipboard.writeText(copyText);
        Toast.fire({
            icon: "success",
            title: `Success!`,
            text: `Copied to clipboard!`,
        });
    });
}

// image url clipboard
$(document).ready(function () {
    // render gallery images
    // call backend => backend fetch s3 picture & response
    $.get({
        url: `/api/1.0/campaigns/images`,
        success: function (body) {
            $.each(body.data, function (idx) {
                const url = body.data[idx];
                const column = `
            <div class='image'>
                <img src=${url}>
                <div class="transparent-box">
                    <p class="opacity-low">Click to copy Url</p>
                </div>
            </div>`;

                $("#image-container").append(column);
            });

            attachClickEvent();
        },
    });
});

// post requst to server to store form data
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
    showClass: {
        popup: "",
        backdrop: "",
    },
    hideClass: {
        popup: "",
        backdrop: "",
    },
});

// send_time、end_time 提示訊息
$("#send-date").on("change", function () {
    let now = moment(new Date()).format("YYYY-MM-DD HH:mm");
    const inputSendTime = $(this).val();
    const diffInMinutes = moment(inputSendTime).diff(now, "minutes");

    if (diffInMinutes <= 5) {
        $("#message").text(
            "To ensure the message could be properly processed, set the send time to at least 5 minutes from now is strongly recommended."
        );
    } else {
        $("#message").empty();
    }
});

$(document).ready(function () {
    $("#save-btn").click(function (event) {
        event.preventDefault();

        // 驗證 periodic-delivery 和 interval 的值是否為數字且最小為 1
        let $periodicDelivery = $("#periodic-delivery");
        let $interval = $("#interval");
        if ($periodicDelivery.prop("checked") && ($interval.val() < 1 || isNaN($interval.val()))) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Interval must be a number greater than or equal to 1.",
            });
            return;
        }

        // 驗證 endtime 的值是否為 0
        // endtime 應大於或等於 sendtime
        let $sendtime = $("#send-date");
        let $endtime = $("#end-date");
        if (
            ($periodicDelivery.prop("checked") && !$endtime.val()) ||
            moment($endtime.val()).isBefore($sendtime.val())
        ) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "For periodic-delivery campaigns, an end time is required and the send time must be later than the end time",
            });
            return;
        }

        $("#save-btn").prop("disabled", true);
        let data = $("#campaign-form").serialize();
        const htmlContent = $("#editor_1").children().first().html();
        data += "&htmlContent=" + encodeURIComponent(htmlContent);

        $.post({
            url: "/api/1.0/campaigns",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: data,
            processData: false,
            success: function (formData) {
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Campaign ${formData.name} created`,
                });

                $("#save-btn").prop("disabled", false);
            },
            error: function (e) {
                Swal.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Campaign not created.  ${e.responseJSON.data}`,
                    // showConfirmButton: true,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });

                $("#save-btn").prop("disabled", false);
            },
        });
    });
});

// open ai auto copy
$(document).ready(function () {
    $("#submit-btn").on("click", function (e) {
        e.preventDefault();
        const tone = $("#tone").val();
        const language = $("#language").val();
        const product = $("#product").val();
        const keywords = $("#keywords").val();
        const channel = $("#channel").val();
        $.ajax({
            url: "/api/1.0/campaigns/autocopy",
            type: "POST",
            dataType: "json",
            data: {
                tone: tone,
                language: language,
                product: product,
                keywords: keywords,
                channel: channel,
            },
            success: function (response) {
                console.log(response);
                $("#auto-copy-response").text(response.data);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $("#clipboard").on("click", async function (e) {
        const copyText = $("#auto-copy-response").text().trim();
        await navigator.clipboard.writeText(copyText);
        Toast.fire({
            icon: "success",
            title: `Success!`,
            text: `Copied!: ${copyText}`,
        });
    });
});

// toggle list for copy & gallery
$(document).ready(function () {
    $(".accordion-header").click(function () {
        $(this).toggleClass("collapsed");
        $(this).toggleClass("show hide");
        $(this).next(".collapse").toggleClass("show hide");
        const expanded = $(this).attr("aria-expanded");
        $(this).attr("aria-expanded", !expanded);
    });
});

//  Quill image
$("#edm-image").css("position", "relative");
async function handleImageSelection(file) {
    // presigned URL
    let url;
    try {
        const response = await axios("/api/1.0/campaigns/s3Url");
        url = response.data.url;
        console.log("get presigned url", url);
    } catch (e) {
        console.log(e);
        return;
    }

    // upload to  S3 bucket
    await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: file,
    });
    const imageUrl = url.split("?")[0];
    console.log(imageUrl);

    const img = document.createElement("img");
    img.src = imageUrl;

    $("#editor_1 h1").after(img);
}

let fileInput = $(".edm-image-container input[type=file]");
fileInput.on("change", async function (event) {
    let file = event.target.files[0];
    console.log(file);
    await handleImageSelection(file);
});

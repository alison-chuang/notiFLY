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
    } else if (cellValue === "web-push") {
        $(".webpush-editor").show();
        $(".email-editor").hide();
    } else {
        $(".webpush-editor").hide();
        $(".email-editor").hide();
    }
});

// show end date if not one-time delivery
$("#periodic-delivery").on("click", function () {
    $(".end-time-type").show();
});
$("#one-time-delivery").on("click", function () {
    $(".end-time-type").hide();
    $("#end-date").val("");
});

// 調整定期推播的表單填寫方式
$('input[name="type"]').change(function () {
    if (this.value === "periodic-delivery") {
        $("#repeat-options").show();
    } else {
        $("#repeat-options").hide();
        $("#interval").val("");
    }
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
let htmlContent;
(function () {
    "use strict";

    Quill.prototype.getHtml = function () {
        console.log(this.container.querySelector(".ql-editor").innerHTML);
        return this.container.querySelector(".ql-editor").innerHTML;
    };

    var quillEd_1 = new Quill("#editor_1", {
        modules: { toolbar: "#toolbar_1" },
        placeholder: "Compose an epic...",
        theme: "snow",
    });

    htmlContent = quillEd_1.root.innerHTML;

    var quillEd_txtArea_1 = document.createElement("textarea");
    var attrQuillTxtArea = document.createAttribute("quill__html");
    quillEd_txtArea_1.setAttributeNode(attrQuillTxtArea);

    var quillCustomDiv = quillEd_1.addContainer("ql-custom");
    quillCustomDiv.appendChild(quillEd_txtArea_1);

    var quillsHtmlBtns = document.querySelectorAll(".ql-html");
    for (var i = 0; i < quillsHtmlBtns.length; i++) {
        quillsHtmlBtns[i].addEventListener("click", function (evt) {
            var wasActiveTxtArea_1 = quillEd_txtArea_1.getAttribute("quill__html").indexOf("-active-") > -1;

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

// image handler
const imageForm = document.querySelector("#imageForm");
const imageInput = document.querySelector("#imageInput");
const gallery = document.querySelector(".gallery");

imageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = imageInput.files[0];

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
    // TODO:用 axios 不會顯示失敗，但會丟 0 byte 空檔案上去
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

    gallery.appendChild(img);
});

// render gallery images
//TODO:call backend => backend fetch s3 picture & response
$.get({
    url: `/api/1.0/campaigns/images`,
    success: function (body) {
        $.each(body.data, function (idx) {
            const url = body.data[idx];
            const column = `<div class="gallery-images">
            <img src=${url} onclick="expand(this)">
            </div>`;
            $(".gallery .image-container").append(column);
        });
    },
});

// gallery effect
function expand(imgs) {
    const expandImg = $("#expandedImg");
    // Use the same src in the expanded image as the image being clicked on from the grid
    expandImg.attr("src", $(imgs).attr("src"));
    // Show the container element (hidden with CSS)
    expandImg.parent().css("display", "block");
}

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
        let $endtime = $("#end-date");
        if ($periodicDelivery.prop("checked") && !$endtime.val()) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "End time is required for periodic-delivery campaign.",
            });
            return;
        }

        $("#save-btn").prop("disabled", true);
        let data = $("#campaign-form").serialize();
        data += "&htmlContent=" + encodeURIComponent(htmlContent);

        $.post({
            url: "/api/1.0/campaigns",
            data: data,
            processData: false,
            success: function (formData) {
                console.log("SUCCESS : ", formData);

                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Campaign ${formData.name} created`,
                });

                $("#save-btn").prop("disabled", false);
            },
            error: function (e) {
                console.log("ERROR : ", e);

                Swal.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Campaign not created ${e.resonseJSON}`,
                    // showConfirmButton: true,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });

                $("#save-btn").prop("disabled", false);
            },
        });
    });
});

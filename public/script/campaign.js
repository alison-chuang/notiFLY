$.get({
    url: `/api/1.0/segments`,
    success: function (body) {
        // 透過迴圈產生選項；iter 的是 index 不是 obj
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

imageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = imageInput.files[0];

    // get presigned url from backend server
    let url;
    try {
        const response = await axios("/api/1.0/s3Url");
        url = response.data.url;
        console.log("get presigned url", url);
    } catch (e) {
        console.log(e);
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
    document.body.appendChild(img);
});

// post requst to my server to store from data
$(document).ready(function () {
    $("#save-btn").click(function (event) {
        event.preventDefault();
        $("#save-btn").prop("disabled", true);
        let data = $("#campaign-form").serialize();
        data += "&htmlContent=" + encodeURIComponent(htmlContent);

        $.post({
            url: "/api/1.0/campaigns",
            data: data,
            processData: false,
            success: function (formData) {
                console.log("SUCCESS : ", formData);
                $("#save-btn").prop("disabled", false);
            },
            error: function (e) {
                console.log("ERROR : ", e);
                $("#save-btn").prop("disabled", false);
            },
        });
    });
});

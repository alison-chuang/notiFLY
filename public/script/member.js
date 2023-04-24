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

// member
const dropArea = $("#member-drag-area");
const dragText = dropArea.find("header");
const fileInput = $("#member-upload");

// 當拖曳檔案進入 drag area 時顯示 "Drop to upload file"
dropArea.on("dragover", (event) => {
    event.preventDefault();
    dropArea.addClass("active");
    dragText.text("Release to Upload File");
});

// 當拖曳檔案離開 drag area 時顯示 "Drag & Drop to Upload File"
dropArea.on("dragleave", () => {
    dropArea.removeClass("active");
    dragText.text("Drag & Drop to Upload File");
});

// 當拖曳檔案放開時讀取檔案名稱、顯示檔案名稱，並檢查檔案類型
dropArea.on("drop", (event) => {
    event.preventDefault();
    const file = event.originalEvent.dataTransfer.files[0];

    const fileType = file.type;
    const validExtensions = ["text/csv"];

    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dropArea.addClass("uploaded");
        dragText.text(`${fileName} Uploaded`);
    } else {
        alert("This file type is not allowed. Only CSV file is allowed.");
        dropArea.removeClass("active");
        dragText.text("Drag & Drop to Upload File");
    }
});

// 當使用 input 按鈕選擇檔案時讀取檔案名稱、顯示檔案名稱，並檢查檔案類型
fileInput.on("change", () => {
    console.log(fileInput);
    const file = fileInput.prop("files")[0];
    const fileType = file.type;
    const validExtensions = ["text/csv"];

    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dropArea.addClass("uploaded");
        dragText.text(`${fileName} Uploaded`);
    } else {
        alert("This file type is not allowed. Only CSV file is allowed.");
        fileInput.val("");
        fileNameSpan.text("");
        dropArea.removeClass("uploaded");
    }
});

// order
const dropAreaOrder = $("#order-drag-area");
const dragTextOrder = dropAreaOrder.find("header");
const fileInputOrder = $("#order-upload");

dropAreaOrder.on("dragover", (event) => {
    event.preventDefault();
    dropAreaOrder.addClass("active");
    dragTextOrder.text("Release to Upload File");
});

dropAreaOrder.on("dragleave", () => {
    dropAreaOrder.removeClass("active");
    dragTextOrder.text("Drag & Drop to Upload File");
});

fileInputOrder.on("drop", (event) => {
    event.preventDefault();
    const file = event.originalEvent.dataTransfer.files[0];
    const fileType = file.type;
    const validExtensions = ["text/csv"];

    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dropAreaOrder.addClass("uploaded");
        dragTextOrder.text(`${fileName} Uploaded`);
    } else {
        alert("This file type is not allowed. Only CSV file is allowed.");
        dropAreaOrder.removeClass("active");
        dragTextOrder.text("Drag & Drop to Upload File");
    }
});

fileInputOrder.on("change", () => {
    const file = fileInputOrder.prop("files")[0];
    const fileType = file.type;
    const validExtensions = ["text/csv"];

    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dropAreaOrder.addClass("uploaded");
        dragTextOrder.text(`${fileName} Uploaded`);
    } else {
        alert("This file type is not allowed. Only CSV file is allowed.");
        fileInputOrder.val("");
        fileNameSpan.text("");
        dropAreaOrder.removeClass("uploaded");
    }
});

// post member form to server
$(document).ready(function () {
    $("#memberUpload").click(function (e) {
        e.preventDefault();
        const file = $("#member-upload").prop("files")[0];
        const fileName = file.name;
        const formData = new FormData();
        formData.append("memberCsv", file, fileName);
        const url = "/api/1.0/members/csv";
        $.post({
            url: url,
            data: formData,
            contentType: false,
            processData: false,

            success: function (response) {
                console.log({ response });

                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Member created`,
                });
            },
            error: function (e) {
                console.error({ e });

                Swal.fire({
                    icon: "Warning",
                    title: `Warning!`,
                    text: `Total attempts${e.responseJSON.data.total}, Inserted successfully${e.responseJSON.data.inserted}
                    \n Please check the data in csv file.`,
                    // showConfirmButton: true,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });
            },
        });
    });
});

// post order form to server
$(document).ready(function () {
    $("#orderUpload").click(function (e) {
        e.preventDefault();
        const file = $("#order-upload").prop("files")[0];
        const fileName = file.name;
        const formData = new FormData();
        formData.append("orderCsv", file, fileName);
        const url = "/api/1.0/members/order/csv";
        $.post({
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log({ response });
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Order updated`,
                });
            },
            error: function (error) {
                console.log({ error });

                Swal.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Please check the format of csv file.`,
                    // showConfirmButton: true,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });
            },
        });
    });
});

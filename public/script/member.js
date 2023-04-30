const token = localStorage.getItem("jwtToken");

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
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

// 當使用 input 按鈕選擇檔案時讀取檔案名稱、顯示檔案名稱，並檢查檔案類型
fileInput.on("change", () => {
    console.log(fileInput);
    const file = fileInput.prop("files")[0];
    const fileType = file.type;
    const validExtensions = ["text/csv"];

    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dragText.text(`${fileName} Uploaded`);
    } else {
        Toast.fire({
            icon: "warning",
            title: `Notice!`,
            text: "This file type is not allowed. Only CSV file is allowed.",
        });
        fileInput.val("");
    }
});

// order
const dropAreaOrder = $("#order-drag-area");
const dragTextOrder = dropAreaOrder.find("header");
const fileInputOrder = $("#order-upload");
const originalTextOrder = "Upload Order Here";

fileInputOrder.on("change", () => {
    const file = fileInputOrder.prop("files")[0];
    const fileType = file.type;
    const validExtensions = ["text/csv"];
    console.log(file);
    if (validExtensions.includes(fileType)) {
        const fileName = file.name;
        dragTextOrder.text(`${fileName} Uploaded`);
    } else {
        Toast.fire({
            icon: "warning",
            title: `Notice!`,
            text: "This file type is not allowed. Only CSV file is allowed.",
        });
        fileInputOrder.val("");
        dragTextOrder.text(originalTextOrder);
    }
});

// post member form to server
$(document).ready(function () {
    $("#memberUpload").click(async function (e) {
        e.preventDefault();
        const file = $("#member-upload").prop("files")[0];
        const fileName = file.name;
        const formData = new FormData();
        formData.append("memberCsv", file, fileName);
        const url = "/api/1.0/members/csv";
        const originalText = "Upload Member Here";

        Swal.fire({
            title: "Processing...",
            text: "Processing a large amount of data. Please wait for a moment",
            didOpen: () => {
                Swal.showLoading();
            },
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        await $.post({
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            success: function (response) {
                console.log({ response });
                fileInput.val("");
                dragText.text(originalText);
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Member created`,
                });
            },
            error: function (e) {
                console.error({ e });
                fileInput.val("");
                dragText.text(originalText);
                try {
                    Swal.fire({
                        icon: "warning",
                        title: `Notice!`,
                        html: `
                        <p>Total attempts ${e.responseJSON.data.total}, Inserted successfully ${e.responseJSON.data.inserted}.</p>
                        <p>There might be some duplicate members.</p>`,
                        showConfirmButton: true,
                        confirmButtonColor: "#F27475",
                    });
                } catch {
                    Swal.fire({
                        icon: "error",
                        title: `Error!`,
                        text: `Insert Failed. Please check the data format in the csv file.`,
                        showConfirmButton: true,
                        confirmButtonColor: "#F27475",
                    });
                }
            },
        });
        Swal.fire({
            title: "Finished!",
            showConfirmButton: false,
            timer: 1000,
        });
    });
});

// post order form to server
$(document).ready(function () {
    $("#orderUpload").click(async function (e) {
        e.preventDefault();
        const file = $("#order-upload").prop("files")[0];
        const fileName = file.name;
        const formData = new FormData();
        formData.append("orderCsv", file, fileName);
        const url = "/api/1.0/members/order/csv";
        Swal.fire({
            title: "Processing...",
            text: "Processing a large amount of data. Please wait for a moment",
            didOpen: () => {
                Swal.showLoading();
            },
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        await $.post({
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            success: function (response) {
                console.log({ response });
                fileInputOrder.val("");
                dragTextOrder.text(originalTextOrder);
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Order updated`,
                });
            },

            error: function (error) {
                console.log({ error });
                fileInputOrder.val("");
                dragTextOrder.text(originalTextOrder);
                if (error.responseJSON.error) {
                    Swal.fire({
                        icon: "error",
                        title: `Error!`,
                        text: error.responseJSON.error,
                        showConfirmButton: true,
                        confirmButtonColor: "#F27475",
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: `Error!`,
                        text: `Insert Failed. Please check the data format in the csv file.`,
                        showConfirmButton: true,
                        confirmButtonColor: "#F27475",
                    });
                }
            },
        });
        Swal.fire({
            icon: "success",
            title: "Finished!",
            showConfirmButton: false,
            timer: 1000,
        });
    });
});

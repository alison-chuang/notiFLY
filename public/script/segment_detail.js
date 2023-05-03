import { renderQueryBuilder } from "./segment.js";
const token = localStorage.getItem("jwtToken");

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

async function getDetail(id) {
    await $.get({
        url: `/api/1.0/segments/${id}`,
        success: function (body) {
            // render rule
            $("#builder-import_export").queryBuilder("setRules", body.data.rules);
            // render name
            $("#name").val(body.data.name);
        },
        error: function (e) {
            Swal.fire({
                icon: "error",
                title: `Error!`,
                text: `Requested segment is not exist`,
            });
            window.location.href = "/segment_list.html";
            console.error("ERROR:", e);
        },
    });
}

async function renderDetail() {
    const query = new URLSearchParams(window.location.search);
    const id = query.get("id");
    await getDetail(id);
}

$(document).ready(async function () {
    await renderQueryBuilder();
    renderDetail();
});

$("#update-btn").on("click", function () {
    let result = $("#builder-import_export").queryBuilder("getMongo");
    let rules = $("#builder-import_export").queryBuilder("getRules");
    const segmentName = $("#name").val();
    const encodedSegmentName = $("<div>").text(segmentName).html();
    const id = window.location.search.replace("?id=", "");

    // segment name can't be empty
    if (!segmentName) {
        Toast.fire({
            icon: "error",
            title: `Error!`,
            text: `Name field is required`,
        });
        return;
    }

    if (!$.isEmptyObject(result)) {
        const data = {
            id: id,
            name: encodedSegmentName,
            query: JSON.parse(JSON.stringify(result, null, 2)),
            rules: rules,
        };
        console.log(data);
        $.ajax({
            url: "/api/1.0/segments",
            type: "PUT",
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            success: function (data) {
                console.log("SUCCESS : ", data);
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `${segmentName} updated.`,
                });
            },
            error: function (e) {
                console.error("ERROR : ", e);
                Toast.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Please contact admin.`,
                });
            },
        });
    }
});

export { Toast };

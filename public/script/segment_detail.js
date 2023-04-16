import { renderQueryBuilder } from "./segment.js";

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
            alert("request segment not exist");
            window.location.href = "/segmentlist.html";
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

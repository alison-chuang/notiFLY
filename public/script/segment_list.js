// init table

$(document).ready(function () {
    $("#segment-table").DataTable({
        searching: true,
        sPaginationType: "full_numbers",
        lengthMenu: [
            [10, 20, 30, -1],
            [10, 20, 30, "All"],
        ],
        serverSide: false,
        stateSave: true,
        destroy: true,
        info: true,
        autoWidth: false,
        ordering: true,
        scrollX: "500px",
        scrollY: "500px",
        scrollCollapse: true,
        paging: true,

        ajax: {
            url: "/api/1.0/segments",
            type: "GET",
        },
        columns: [
            {
                data: "name",
            },
            {
                data: "created_at",
                title: "Last Updated",
                render: function (data) {
                    var localTime = moment.utc(data).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD HH:mm:ss");
                },
            },
            { data: "owner" },
            {
                data: null,
                title: "Action",
                render: function (data, type, row) {
                    return `<a href="/segment_detail.html?id=${row._id}">
                                <button type="button" class="btn btn-secondary btn-sm">Update</button>
                            </a>`;
                },
            },
        ],
        processing: true,
    });
});

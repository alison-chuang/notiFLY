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

let filters = [
    {
        id: "gender",
        label: "Gender",
        type: "integer",
        input: "radio",
        values: {
            n: "Non-binary",
            m: "Male",
            f: "Female",
        },
        operators: ["equal", "not_equal"],
    },
    {
        id: "birthday_month",
        label: "Birthday month",
        type: "integer",
        input: "select",
        values: {
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December",
        },
        operators: ["equal", "not_equal"],
    },
    {
        id: "birthday_year",
        label: "Birthday year",
        type: "integer",
        placeholder: "1997",
        operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
        ],
        validation: {
            min: 1900,
            step: 1,
        },
    },
    {
        id: "total_spending",
        label: "Total spending",
        type: "integer",
        operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
        ],
    },
    {
        id: "total_purchase_count",
        label: "Total purchase times",
        type: "integer",
        operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
        ],
    },
    // {
    //     id: "created_at",
    //     label: "Signed up at",
    //     type: "date",
    //     validation: {
    //         format: "YYYY-MM-DD",
    //     },
    //     plugin: "datepicker",
    //     plugin_config: {
    //         format: "yyyy-mm-dd",
    //         todayBtn: "linked",
    //         todayHighlight: true,
    //         autoclose: true,
    //     },
    //     operators: [
    //         "equal",
    //         "not_equal",
    //         "less",
    //         "less_or_equal",
    //         "greater",
    //         "greater_or_equal",
    //         "between",
    //         "not_between",
    //     ],
    // },
];

async function getCityOptions() {
    try {
        const data = await $.get("/api/1.0/segments/cities");
        const cities = data.data;
        filters.push({
            id: "city",
            label: "City",
            type: "string",
            input: "select",
            values: cities,
            operators: ["equal", "not_equal"],
        });
        filters.sort(function (a, b) {
            // Compare the 2 dates
            const res = a.label < b.label ? -1 : 1;
            return res;
        });
    } catch (e) {
        console.error("ERROR : ", e);
    }
}

export async function renderQueryBuilder() {
    try {
        await getCityOptions();
        $("#builder-import_export").queryBuilder({
            filters: filters,
        });
    } catch (e) {
        console.error("ERROR : ", e);
    }
}

$(document).ready(function () {
    renderQueryBuilder();
});

$(".reset").on("click", function () {
    let target = $(this).data("target");

    $("#builder-" + target).queryBuilder("reset");
});

$(".set-mongo").on("click", function () {
    let target = $(this).data("target");
    let mongo = window["mongo_" + target];

    $("#builder-" + target).queryBuilder("setRulesFromMongo", mongo);
});

$(".save").on("click", function () {
    let result = $("#builder-import_export").queryBuilder("getMongo");
    let rules = $("#builder-import_export").queryBuilder("getRules");
    const segmentName = $("#name").val();
    const encodedSegmentName = $("<div>").text(segmentName).html();

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
            name: encodedSegmentName,
            query: JSON.parse(JSON.stringify(result, null, 2)),
            rules: rules,
        };

        $.post({
            url: "/api/1.0/segments",
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
                    text: `Segment created`,
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

$(".parse-mongo-check").on("click", function () {
    let test = $("#builder-import_export").queryBuilder("getRules");
    console.log("TEST", test);
    let result = $("#builder-import_export").queryBuilder("getMongo");
    if (!$.isEmptyObject(result)) {
        const data = {
            query: JSON.parse(JSON.stringify(result, null, 2)),
        };

        Toast.fire({
            title: "Checking...",
            didOpen: () => {
                Toast.showLoading();
            },
            showConfirmButton: false,
            allowOutsideClick: false,
        });

        $.post({
            url: "/api/1.0/segments/count",
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false,
            success: function (data) {
                console.log("MEMBER COUNTS : ", data);
                Toast.close();
                $("#member-count").html(`
                <p>Estimated matched member :</p>
                <p>${data.data}</p>`);
            },
            error: function (e) {
                console.error("ERROR : ", e);
                Toast.close();
                Toast.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Please contact admin.`,
                });
            },
        });
    }
});

// view example
$("#segment-example").on("click", function () {
    Swal.fire({
        title: "Sweet!",
        text: "Modal with a custom image.",
        imageUrl: "https://unsplash.it/400/200",
        imageWidth: 400,
        imageHeight: 200,
        width: "70%",
        height: "auto",
        imageAlt: "Custom image",
    });
});

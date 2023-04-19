// $(document).ready(function () {
//     $(".dropdown").select2();
// });

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
            min: 1923,
            step: 1,
        },
    },
    {
        id: "created_at",
        label: "Signed up at",
        type: "date",
        validation: {
            format: "YYYY-MM-DD",
        },
        plugin: "datepicker",
        plugin_config: {
            // TODO: 可以再調整
            format: "yyyy-mm-dd",
            todayBtn: "linked",
            todayHighlight: true,
            autoclose: true,
        },
        // TODO: Date operater 對嗎？
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
        //TODO: 怎麼處理日期
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
    //     id: "products",
    //     label: "Products",
    //     type: "string",
    //     operators: [
    //         "equal",
    //         "not_equal",
    //         "contains",
    //         "not_contains",
    //         "begins_with",
    //         "not_begins_with",
    //         "ends_with",
    //         "not_ends_with",
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
    // TODO 多存 rules
    if (!$.isEmptyObject(result)) {
        const data = {
            name: segmentName,
            query: JSON.parse(JSON.stringify(result, null, 2)),
            rules: rules,
        };
        console.log(data);
        $.post({
            url: "/api/1.0/segments",
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false,
            success: function (data) {
                console.log("SUCCESS : ", data);
                alert("created");
            },
            error: function (e) {
                console.error("ERROR : ", e);
                alert("error");
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

        $.post({
            url: "/api/1.0/segments/count",
            data: JSON.stringify(data),
            contentType: "application/json",
            processData: false,
            success: function (data) {
                console.log("MEMBER COUNTS : ", data);
                $("#member-count").html(`
                <p>Estimated matched member :</p>
                <p>${data.data}</p>`);
            },
            error: function (e) {
                console.error("ERROR : ", e);
            },
        });
    }
});

async function getDetail(id) {
    await $.get({
        url: `/api/1.0/campaigns/${id}`,
        success: function (body) {
            console.log({ body });

            let sendTime = moment(body.data.send_time);
            let format = "YYYY-MM-DDTHH:mm";
            let endTime = moment(body.data.end_time);

            // render db campaign data
            $("#name").val(body.data.name);
            $("#channel").val(body.data.channel);
            $("#segmentId").val(body.data.segmentId);
            $("#send-date").val(sendTime.format(format));
            $("#interval").val(body.data.interval);
            $("#end-date").val(endTime.format(format));
            $("#title").val(body.data.message_variant[0].title);
            $("#subject").val(body.data.message_variant[0].subject);
            $("#copy").val(body.data.message_variant[0].copy);
            $("#landing").val(body.data.message_variant[0].landing);
            $("#image").val(body.data.message_variant[0].image);
        },

        error: function (e) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Requested campaign not exist",
                showConfirmButton: true,
            });
            window.location.href = "/campaing_list.html";
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
    await renderDetail();

    let cellValue = $("#channel").val();
    let typeValue = $("input[name='type']").val();

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

    if (typeValue === "periodic-delivery") {
        $("#repeat-options").show();
        $(".end-time-type").show();
        $("#periodic-delivery").prop("checked", true);
    } else if (typeValue === "one-time-delivery") {
        $("#repeat-options").hide();
        $(".end-time-type").hide();
        $("#one-time-delivery").prop("checked", true);
    }
});

$(document).ready(function () {
    $("#update-btn").click(function (event) {
        event.preventDefault();

        let $periodicDelivery = $("#periodic-delivery");
        let $interval = $("#interval");
        let $endtime = $("#end-date");
        if ($periodicDelivery.prop("checked")) {
            // 驗證 periodic-delivery 和 interval 的值是否為數字且最小為 1
            if ($interval.val() < 1 || isNaN($interval.val())) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Interval must be a number greater than or equal to 1.",
                });
                return;
            }
            // 驗證 endtime 的值是否為 0
            if (!$endtime.val()) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "End time is required for periodic-delivery campaign.",
                });
                return;
            }
        } else {
            $interval.val(0);
            $("#end-date").val($("#send-date").val());
        }

        $("#update-btn").prop("disabled", true);
        let data = $("#campaign-form").serialize();
        const htmlContent = $("#editor_1").children().first().html();
        data += "&htmlContent=" + encodeURIComponent(htmlContent);
        const id = window.location.search.replace("?id=", "");
        data += `&id=${id}`;

        $.ajax({
            method: "put",
            url: "/api/1.0/campaigns",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: data,
            processData: false,
            success: function (formData) {
                console.log(formData);
                Toast.fire({
                    icon: "success",
                    title: `Success!`,
                    text: `Campaign updated`,
                });

                $("#update-btn").prop("disabled", false);
            },
            error: function (e) {
                Swal.fire({
                    icon: "error",
                    title: `Error!`,
                    text: `Campaign is not updated.  ${e.responseJSON.data}`,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });

                $("#update-btn").prop("disabled", false);
            },
        });
    });
});

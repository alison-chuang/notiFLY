console.log = () => {};

$("#tour").on("click", function () {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true,
            },
            classes: "class-1 class-2",
            scrollTo: { behavior: "smooth", block: "center" },
        },
        useModalOverlay: true,
    });

    tour.addStep({
        title: "STEP 1 : Member",
        text: "- Import your company's member data to notiFLY via :  </br></br> 1. API endpoint ( NPM provided ) </br> 2. CSV file upload",
        attachTo: {
            element: "#tour-step-1",
            on: "right",
        },
        buttons: [
            {
                action() {
                    return this.next();
                },
                text: "Next",
            },
        ],
        id: "step1",
    });

    tour.addStep({
        title: "STEP 2 : Segment",
        text: "- Define target audience conditions for notification campaigns.  </br></br> - We find right recipients from your member data. ",
        attachTo: {
            element: "#tour-step-2",
            on: "right",
        },
        buttons: [
            {
                action() {
                    return this.back();
                },
                classes: "shepherd-button-secondary",
                text: "Back",
            },
            {
                action() {
                    return this.next();
                },
                text: "Next",
            },
        ],
        id: "step2",
    });

    tour.addStep({
        title: "STEP 3 : Campaign",
        text: "- Compose your notification campaign.  </br></br>  - We deliver to right members at your desired time. </br></br> - View campaigns' results .",
        attachTo: {
            element: "#tour-step-3",
            on: "right",
        },
        buttons: [
            {
                action() {
                    return this.back();
                },
                classes: "shepherd-button-secondary",
                text: "Back",
            },
            {
                action() {
                    return this.next();
                },
                text: "Next",
            },
        ],
        id: "step3",
    });

    tour.addStep({
        title: "Other : Account Management",
        text: "Company's admin could create new account for colleagues.",
        attachTo: {
            element: "#tour-step-4",
            on: "right",
        },
        buttons: [
            {
                action() {
                    return this.back();
                },
                classes: "shepherd-button-secondary",
                text: "Back",
            },
            {
                action() {
                    tour.complete();
                },
                text: "Exit",
            },
        ],
        id: "step4",
    });

    tour.start();
});

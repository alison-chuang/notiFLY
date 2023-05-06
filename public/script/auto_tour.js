// 一進這個頁面就自動跳出，提示點選 web tour
const autotour = new Shepherd.Tour({
    defaultStepOptions: {
        cancelIcon: {
            enabled: true,
        },
        classes: "class-1 class-2",
        scrollTo: { behavior: "smooth", block: "center" },
    },
    useModalOverlay: true,
});

autotour.addStep({
    title: "<strong>Get started with notiFLY</strong> ",
    text: `Click <strong>Web Tour</strong> </br></br> - Explore our three main features : Member, Segment, Campaign.</br></br>`,
    attachTo: {
        element: "#tour-step-0",
        on: "right",
    },
    // buttons: [
    //     {
    //         action() {
    //             autotour.complete();
    //         },
    //         classes: "shepherd-button-secondary",
    //         text: "Got it!",
    //     },
    // ],
    id: "step0",
});
autotour.start();

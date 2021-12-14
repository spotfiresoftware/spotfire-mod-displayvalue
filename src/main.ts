import { render } from "./render";

window.Spotfire.initialize(async (mod) => {
    const context = mod.getRenderContext();

    /**
     * Create reader function which is actually a one time listener for the provided values.
     */
    const reader = mod.createReader(
        mod.visualization.data(),
        mod.windowSize(),
        mod.visualization.axis("Value")
    );

    /**
     * Creates a function that is part of the main read-render loop.
     * It checks for valid data and will print errors in case of bad data or bad renders.
     * It calls the listener (reader) created earlier and adds itself as a callback to complete the loop.
     */
    reader.subscribe(async (dataView, windowSize, ...axes) => {
        try {
            const errors = await dataView.getErrors();
            if (errors.length > 0) {
                mod.controls.errorOverlay.show(errors, "DataView");
            } else {
                mod.controls.errorOverlay.hide("DataView");

                const allRows = await dataView.allRows();
                if (allRows === null) {
                    return;
                }

                await render(dataView, windowSize, axes, mod);

                context.signalRenderComplete();

                mod.controls.errorOverlay.hide("General");
            }
        } catch (e) {
            console.error(e);
            mod.controls.errorOverlay.show(
                e.message || "☹️ Something went wrong, check developer console",
                "General"
            );
        }
    });
});

(function(){
	const {
        computePosition, 
        flip,
        shift,
        offset,
        arrow,
    } =  FloatingUIDOM;
    const tooltipTargets = document.querySelectorAll('.tooltip-target');
    tooltipTargets.forEach(tooltipTarget => {
        const tooltip = tooltipTarget.querySelector('.tooltip');
        const arrowElement = tooltipTarget.querySelector('.arrow');
        if(tooltip && arrowElement) {
            const arrowSize = parseInt(arrowElement.dataset.size || '8');
            const tooltipPlacement = tooltip.dataset.placement || 'top';
            arrowElement.style.width = `${arrowSize}px`;
            arrowElement.style.height = `${arrowSize}px`;

            function showTooltip() {
                computePosition(tooltipTarget, tooltip, {
                    placement: tooltipPlacement,
                    middleware: [
                        offset(6),
                        flip(),
                        shift({padding: 5}),
                        arrow({element: arrowElement}),
                    ],
                }).then(({ x, y, placement, middlewareData }) => {
                    Object.assign(tooltip.style, {
                        top: `${y}px`,
                        left: `${x}px`
                    });

                    const {x: arrowX, y: arrowY} = middlewareData.arrow;

                    const staticSide = {
                        top: 'bottom',
                        right: 'left',
                        bottom: 'top',
                        left: 'right',
                    }[placement.split('-')[0]];

                    Object.assign(arrowElement.style, {
                        left: arrowX != null ? `${arrowX}px` : '',
                        top: arrowY != null ? `${arrowY}px` : '',
                        right: '',
                        bottom: '',
                        [staticSide]: `-${arrowSize/2}px`,
                    });
                });
            }

            [
                ['mouseenter', showTooltip],
                ['focus', showTooltip],
            ].forEach(([event, listener]) => {
                tooltipTarget.addEventListener(event, listener);
            });
        }
    });
})();
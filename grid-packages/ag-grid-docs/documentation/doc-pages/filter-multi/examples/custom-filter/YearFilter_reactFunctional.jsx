import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef(({ filterChangedCallback }, ref) => {
    const [isActive, setIsActive] = useState(false);
    const [activated, setActivated] = useState(false);
    const toggleFilter = isActive => {
        setIsActive(isActive);
        setActivated(activated || isActive);
    };

    useEffect(() => {
        if (activated) {
            filterChangedCallback();
        }
    }, [isActive, activated]);

    const setModel = model => toggleFilter(!!model);
    const isFilterActive = () => isActive;

    useImperativeHandle(ref, () => ({
        doesFilterPass: params => {
            return params.data.year > 2004;
        },

        isFilterActive,

        getModel: () => {
            return isFilterActive() || null;
        },

        setModel,

        onFloatingFilterChanged: value => {
            setModel(value);
        }
    }));

    return (
        <div className="year-filter">
            <label>
                <input type="radio" checked={!isActive} onChange={() => toggleFilter(false)} /> All
            </label>
            <label>
                <input type="radio" checked={isActive} onChange={() => toggleFilter(true)} /> After 2004
            </label>
        </div>
    );
});

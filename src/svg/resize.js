const resize = (baseWidth, baseHeight, targetWidth, targetHeight) => {
    if (targetWidth === 0 && targetHeight === 0) return [baseWidth, baseHeight];
    if (targetWidth !== 0 && targetHeight !== 0) return [targetWidth, targetHeight];
    if (targetWidth !== 0) return [targetWidth, baseHeight * targetWidth / baseWidth];
    return [baseWidth * targetHeight / baseHeight, targetHeight];
};

export {
    resize
};

export const getASINFromLink = (link: string) => {
    const linkSplits = link.split('/');
    const dpIndex = linkSplits.findIndex((value) => value === 'dp');
    const ASINIndex = dpIndex + 1;

    return linkSplits[ASINIndex];
};

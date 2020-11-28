export const getAmazonTableFromContent = (productASINs: string[]) =>
    `[amazon template="table" box="${productASINs.join(',')}" /]`;

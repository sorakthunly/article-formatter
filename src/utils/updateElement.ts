export const appendElement = (content: string, element: string) =>
    content + `\n${element}\n`;

export const prependElement = (content: string, element: string) =>
    `\n${element}\n` + content;

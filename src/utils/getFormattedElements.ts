import { getASINFromLink } from './getASINFromLink';
import { prependElement } from './updateElement';

export const getHeading2 = (content: string) => `<h2>${content}</h2>`;

export const getHeading2WithPrependedDivider = (content: string) =>
    prependElement(getHeading2(content), '<hr />');

export const getHeading3 = (content: string) => `<h3>${content}</h3>`;

export const getParagraphBold = (content: string) =>
    `<p><strong>${content}</strong></p>`;

export const getParagraphCentered = (content: string) =>
    `<p style="text-align: center;">${content}</p>`;

export const getListItem = (content: string) =>
    `<li><span>${content}</span></li>`;

export const getImageCentered = (imageLink: string, title: string) => {
    const titleSplits = title.split(' ');
    const imageAlt = titleSplits.splice(1, titleSplits.length).join(' ');

    return getParagraphCentered(
        `<img class="alignnone" src="${imageLink}" alt="${imageAlt}" style="max-height: 300px; max-width: 300px;" />`
    );
};

export const getBuyButton = (link: string) => {
    const productASIN = getASINFromLink(link);
    return `[Azonasinid asinid="${productASIN}"]`;
};

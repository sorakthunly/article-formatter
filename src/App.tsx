import React, { Fragment, useState, FunctionComponent } from 'react';
import './App.css';
import { Container, Navbar, Form, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { copyTextToClipboard } from './utils/copyToClipboard';
import {
    getImageCentered,
    getBuyButton,
    getParagraphCentered,
    getHeading2,
    getParagraphBold,
    getHeading2WithPrependedDivider,
    getListItem,
    getHeading3,
} from './utils/getFormattedElements';
import range from 'lodash.range';
import { startCase } from './utils/startCase';
import { appendElement, prependElement } from './utils/updateElement';
import { getAmazonTableFromContent } from './utils/getAmazonTableFromContent';
import { getASINFromLink } from './utils/getASINFromLink';

const AMAZON_SITE_PREFIX = 'https://www.amazon.com';
const PRODUCT_HEADING_REGEX = /^[0-9]+[.]/;
const PRODUCT_HEADING_HTML_REGEX = /^([<]+[h3]+[>]+[0-9]+[.])/;

const HEADING_2_TEXTS = [
    'conclusion',
    'frequently asked questions',
    'buying guides to',
];

const WHAT_WE_LIKE = 'what we like';
const WHAT_WE_DONT_LIKE = "what we don't like";
const WHAT_WE_DONT_LIKE_APOSTROPHE = 'what we don’t like';
const PARAGRAPH_BOLD_TEXTS = [
    WHAT_WE_LIKE,
    WHAT_WE_DONT_LIKE,
    WHAT_WE_DONT_LIKE_APOSTROPHE,
];

const FormatterContainer = styled(Container)`
    padding: 24px 0;
`;

const TextareaWrapper = styled.div`
    margin-bottom: 16px;
`;

const checkStartWith = (startWithTexts: string[], textToCheck: string) =>
    startWithTexts.some((text) => textToCheck.toLowerCase().startsWith(text));

const App: FunctionComponent = () => {
    const [rawContent, setRawContent] = useState<string>('');

    const handleFormatContent = async () => {
        const paragraphs = rawContent
            .split('\n')
            .filter((content) => content && content !== ' ');

        const linksToRemove: string[] = [];
        const productASINs: string[] = [];

        const formattedParagraphs = paragraphs.map((paragraph, index) => {
            const isArticleHeading = paragraph
                .toLowerCase()
                .startsWith('list of top');
            if (isArticleHeading) {
                return getHeading2(paragraph);
            }

            const isProductHeading = PRODUCT_HEADING_REGEX.test(paragraph);
            if (isProductHeading) {
                let productHeading = getHeading3(paragraph);

                const productLinkIndex = index + 1;
                const productLink = paragraphs[productLinkIndex];
                const isProductLinkValid = productLink.startsWith(
                    AMAZON_SITE_PREFIX
                );
                if (isProductLinkValid) {
                    linksToRemove.push(productLink);
                    const productASIN = getASINFromLink(productLink);
                    productASINs.push(productASIN);

                    const buyButton = getBuyButton(productLink);
                    const buyButtonCentered = getParagraphCentered(buyButton);
                    productHeading = appendElement(
                        productHeading,
                        buyButtonCentered
                    );
                }

                return productHeading;
            }

            const isHeading2 = checkStartWith(HEADING_2_TEXTS, paragraph);
            if (isHeading2) {
                const formattedParagraph = getHeading2(startCase(paragraph));

                return getHeading2WithPrependedDivider(formattedParagraph);
            }

            const isParagraphBold = checkStartWith(
                PARAGRAPH_BOLD_TEXTS,
                paragraph
            );
            if (isParagraphBold) {
                const matchingParagraph = PARAGRAPH_BOLD_TEXTS.find((text) =>
                    paragraph.toLowerCase().includes(text)
                );
                return getParagraphBold(startCase(`${matchingParagraph}:`));
            }

            return paragraph;
        });

        const bulletPointRange: number[] = [];
        formattedParagraphs.forEach((paragraph, index) => {
            const isWhatWeLike = paragraph.toLowerCase().includes(WHAT_WE_LIKE);
            if (isWhatWeLike) {
                bulletPointRange.push(index);
            }

            const isWhatWeDontLike =
                paragraph.toLowerCase().includes(WHAT_WE_DONT_LIKE) ||
                paragraph.toLowerCase().includes(WHAT_WE_DONT_LIKE_APOSTROPHE);
            if (isWhatWeDontLike) {
                bulletPointRange.push(index);
            }

            const isProductHeading = PRODUCT_HEADING_HTML_REGEX.test(paragraph);
            if (isProductHeading && bulletPointRange.length > 0) {
                bulletPointRange.push(index);
            }
        });

        const shouldFormatUnorderedList = bulletPointRange.length > 1;
        if (shouldFormatUnorderedList) {
            const bulletPointRangeMap = bulletPointRange.reduce<number[][]>(
                (prev, next, index) => {
                    return [...prev, [next, bulletPointRange[index + 1]]];
                },
                []
            );

            bulletPointRangeMap.forEach(([start, end]) => {
                if (typeof start !== 'number' || typeof end !== 'number') {
                    return;
                }

                const isStartParagraphHeading = PARAGRAPH_BOLD_TEXTS.some(
                    (paragraph) =>
                        formattedParagraphs[start]
                            .toLowerCase()
                            .includes(paragraph)
                );
                if (isStartParagraphHeading) {
                    const listRange = range(start + 1, end);
                    listRange.forEach((paragraphIndex, index) => {
                        let listItem = getListItem(
                            formattedParagraphs[paragraphIndex]
                        );

                        const isListStart = index === 0;
                        const isListEnd = index === listRange.length - 1;
                        if (isListStart) {
                            listItem = prependElement(listItem, '<ul>');
                        }
                        if (isListEnd) {
                            listItem = appendElement(listItem, '</ul>');
                        }

                        formattedParagraphs[paragraphIndex] = listItem;
                    });
                }
            });
        }

        const hasProductASINs = productASINs.length > 0;
        const articleHeadingIndex = formattedParagraphs.findIndex((paragraph) =>
            paragraph.toLowerCase().startsWith('<h2>list of top')
        );
        if (hasProductASINs && articleHeadingIndex > -1) {
            const amazonTable = getAmazonTableFromContent(productASINs);
            formattedParagraphs.splice(articleHeadingIndex + 1, 0, amazonTable);
        }

        const formattedContent = formattedParagraphs
            .filter((paragraph) => !linksToRemove.includes(paragraph))
            .join('\n\n');

        copyTextToClipboard(formattedContent);
        alert('Successfully Copied');
    };

    return (
        <Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="#home">Amazon Affiliate Pal</Navbar.Brand>
            </Navbar>
            <FormatterContainer>
                <h1>Article Formatter</h1>
                <p>Enter your article to be formatted below:</p>
                <TextareaWrapper>
                    <Form.Control
                        as="textarea"
                        onChange={(event) => setRawContent(event.target.value)}
                        rows={15}
                    />
                </TextareaWrapper>
                <Button block onClick={handleFormatContent} variant="primary">
                    Format and Copy to Clipboard
                </Button>
            </FormatterContainer>
        </Fragment>
    );
};

export default App;

export const startCase = (content: string) => {
    const words = content.split(' ');
    const wordsWithStartCase = words.map((word) => {
        if (word) {
            const firstLetter = word[0].toUpperCase();

            return firstLetter + word.slice(1, word.length);
        }

        return word;
    });

    return wordsWithStartCase.join(' ');
};

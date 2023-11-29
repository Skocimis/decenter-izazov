const prettyFormat = (number, max_decimals) => {
    number = parseFloat(number);
    let formattedNumber;

    if (max_decimals === undefined) {
        formattedNumber = number.toLocaleString('en', { maximumFractionDigits: 20 });
    } else {
        formattedNumber = number.toLocaleString('en', { minimumFractionDigits: max_decimals, maximumFractionDigits: max_decimals });
    }

    return formattedNumber;
}

const formatBigNumber = (number, decimals) => {
    number = parseFloat(number);
    if (number > 1000000000000)
        return (number / 1000000000000).toFixed(decimals) + "T";

    if (number > 1000000000)
        return (number / 1000000).toFixed(decimals) + "B";

    if (number > 1000000)
        return (number / 1000000).toFixed(decimals) + "M";

    if (number >= 1000)
        return prettyFormat(number, 0);

    return prettyFormat(number, Math.max(decimals, 2));
}

const formatOwner = owner => {
    if (!owner || owner.length < 11)
        return owner;
    return `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`;
};

export { formatBigNumber, prettyFormat, formatOwner }
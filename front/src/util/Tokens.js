import axios from 'axios';

const Tokens = {
    "ETH-A": {
        default_price: 2048.195,
        coingecko_id: 'ethereum',
        ratio: 1.45
    },
    "WBTC-A": {
        default_price: 38155.04,
        coingecko_id: 'wrapped-bitcoin',
        ratio: 1.45
    },
    "USDC-A": {
        default_price: 1,
        coingecko_id: 'usd-coin',
        ratio: 1.01
    }
};

const getTokenPrice = async (token) => {
    const tokenData = Tokens[token];
    if (!tokenData)
        return 1;
    try {
        const cachedData = localStorage.getItem(token);
        if (cachedData) {
            const { price, date_modified } = JSON.parse(cachedData);
            if (new Date() - new Date(date_modified) < 10 * 60 * 1000) {
                return price;
            }
        }

        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenData.coingecko_id}&vs_currencies=usd`);
        const newPrice = response.data[tokenData.coingecko_id].usd;

        localStorage.setItem(token, JSON.stringify({ price: newPrice, date_modified: new Date() }));
        return newPrice;
    } catch (error) {
        return tokenData.default_price;
    }
};

const getTokenPriceSync = (token) => {
    const tokenData = Tokens[token];
    if (!tokenData)
        return 1;
    return JSON.parse(localStorage.getItem(token))?.price || tokenData.default_price;
};

const getTokens = () => {
    return Object.keys(Tokens);
}

const getTokenRatio = (token) => {
    return Tokens[token]?.ratio || 1;
}
export { getTokenPrice, getTokenRatio, getTokens, getTokenPriceSync };

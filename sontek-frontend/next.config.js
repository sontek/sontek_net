module.exports = {
    images: {
        loader: "custom",
    },
    headers: async function () {
        return [
            {
                source: "/rss",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/rss+xml",
                    },
                ],
            },
        ];
    },
};

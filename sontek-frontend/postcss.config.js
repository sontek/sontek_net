const defaultPlugins = [
    "postcss-import-url",
    [
        "postcss-import",
        {
            path: "app/css",
        },
    ],
    "postcss-easings",
    [
        "postcss-preset-env",
        {
            stage: 0,
            features: {
                "logical-properties-and-values": false,
                "prefers-color-scheme-query": false,
                "gap-properties": false,
            },
        },
    ],
];

const dev = {
    plugins: [...defaultPlugins],
};

const prod = {
    plugins: [
        ...defaultPlugins,
        "cssnano",
        {
            preset: "default",
        },
    ],
};

module.exports = process.env.NODE_ENV === "production" ? prod : dev;

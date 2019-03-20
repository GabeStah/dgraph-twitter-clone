declare const production: {
    dgraph: {
        adapter: {
            address: string;
        };
        api: {
            protocol: string;
            host: string;
            port: number;
        };
    };
    faker: {
        seed: number;
    };
};
export default production;

let landersData: Map<string, Object>;

const service = {
    init: () => {
        landersData = new Map<string, Object>;
    },

    setLandersData(data: any) {
        landersData = new Map(data);
    },

    getLandersData(): any {
        return landersData;
    }
}

export default service;
export interface GeneratedNPC {
    fullName: string;
    nickName: string;
    race: string;
    gender: string;

    profession: {
        title: string;
        description: string;
    };

    build: string;

    skin: {
        tone: string;
        comp: string;
    };

    eye: {
        shape: string;
        color: string;
    };

    hair: {
        style: string;
        color: string;
        facial: string;
    };

    descriptors: string;
    demeanor: string;
    activities: string;
    clan: string;
}
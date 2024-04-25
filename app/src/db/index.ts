import Dexie, { IndexableType } from 'dexie';

interface Repository {
    /**
     * The name of the store (table in SQL)
     */
    readonly name: string;

    /**
     * @see https://dexie.org/docs/Version/Version.stores()#schema-syntax
     */
    getSchema: (version: number) => string;
    create: Function;
    get: Function;
}

interface RepositoryConstructable {
    new (db:Dexie): Repository
}

export const initiateDb = (name: string, repositories: Array<RepositoryConstructable>): Dexie => {
    const version = 1;

    // @see https://dexie.org/docs/Dexie/Dexie
    const db = new Dexie(name, {cache: 'immutable'});

    const schema: {[tableName: string]: string} = {};

    repositories.forEach((repoClass: RepositoryConstructable) => {
        const repo = new repoClass(db);

        schema[repo.name] = repo.getSchema(version);
    });

    db.version(version).stores(schema);
    
    return db;
}

declare type SolarAccess = {
    reference: string;
    key: string;
}

export class SolarAccessRepository {
    #db: Dexie;
    #storeName: string = 'solar-access';

    constructor(db: Dexie) {
        this.#db = db;
    }

    get name() {
        return this.#storeName;
    }

    getSchema() {
        return "reference";
    } 

    create(value: SolarAccess) : Promise<IndexableType> {
        return this.#db.table(this.#storeName).add(value);
    }

    get(reference: string): Promise<SolarAccess> {
        return this.#db.table(this.#storeName).get(reference)
    }
}
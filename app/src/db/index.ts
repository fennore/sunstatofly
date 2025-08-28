import type { IndexableType } from 'dexie';
import { Dexie } from 'dexie';

interface Repository {
    /**
     * The name of the store (table in SQL)
     */
    readonly name: string;

    /**
     * @see https://dexie.org/docs/Version/Version.stores()#schema-syntax
     */
    getSchema: (version: number) => string;
    
    /**
     * @see https://dexie.org/docs/Table/Table.add()
     */
    create: Function;

    /**
     * @see https://dexie.org/docs/Table/Table.get()
     */
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

declare type SolarPlant = {
    reference: string;
    plantUid: string;
}

export class SolarPlantRepository {
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

    create(value: SolarPlant) : Promise<IndexableType> {
        return this.#db.table(this.#storeName).add(value);
    }

    get(reference: string): Promise<SolarPlant> {
        return this.#db.table(this.#storeName).get(reference)
    }
}
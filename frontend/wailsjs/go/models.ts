export namespace atscheck {
	
	export class Finding {
	    code: string;
	    severity: string;
	    field: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new Finding(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.severity = source["severity"];
	        this.field = source["field"];
	        this.message = source["message"];
	    }
	}

}

export namespace atsmatch {
	
	export class Suggestion {
	    entryId: string;
	    suggestion: string;
	
	    static createFrom(source: any = {}) {
	        return new Suggestion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.entryId = source["entryId"];
	        this.suggestion = source["suggestion"];
	    }
	}

}

export namespace atsscore {
	
	export class FinalReport {
	    score: number;
	    formatScore: number;
	    contentScore?: number;
	    formatFindings: atscheck.Finding[];
	    matchedSkills?: string[];
	    missingSkills?: string[];
	    suggestions?: atsmatch.Suggestion[];
	    contentPending: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FinalReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.score = source["score"];
	        this.formatScore = source["formatScore"];
	        this.contentScore = source["contentScore"];
	        this.formatFindings = this.convertValues(source["formatFindings"], atscheck.Finding);
	        this.matchedSkills = source["matchedSkills"];
	        this.missingSkills = source["missingSkills"];
	        this.suggestions = this.convertValues(source["suggestions"], atsmatch.Suggestion);
	        this.contentPending = source["contentPending"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace cv {
	
	export class Entry {
	    id: string;
	    sectionId: string;
	    orderKey: string;
	    title: string;
	    subtitle: string;
	    location: string;
	    dateStart?: string;
	    dateEnd?: string;
	    isCurrent: boolean;
	    description: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    meta: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new Entry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sectionId = source["sectionId"];
	        this.orderKey = source["orderKey"];
	        this.title = source["title"];
	        this.subtitle = source["subtitle"];
	        this.location = source["location"];
	        this.dateStart = source["dateStart"];
	        this.dateEnd = source["dateEnd"];
	        this.isCurrent = source["isCurrent"];
	        this.description = source["description"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.meta = source["meta"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Section {
	    id: string;
	    cvId: string;
	    sectionType: string;
	    title: string;
	    orderKey: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    entries?: Entry[];
	
	    static createFrom(source: any = {}) {
	        return new Section(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.cvId = source["cvId"];
	        this.sectionType = source["sectionType"];
	        this.title = source["title"];
	        this.orderKey = source["orderKey"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.entries = this.convertValues(source["entries"], Entry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CV {
	    id: string;
	    title: string;
	    language: string;
	    templateId: string;
	    fullName: string;
	    jobTitle: string;
	    email: string;
	    phone: string;
	    location: string;
	    linkedin: string;
	    github: string;
	    website: string;
	    summary: string;
	    photoPath?: string;
	    photoSize: number;
	    sourceCvId?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    sections?: Section[];
	
	    static createFrom(source: any = {}) {
	        return new CV(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.language = source["language"];
	        this.templateId = source["templateId"];
	        this.fullName = source["fullName"];
	        this.jobTitle = source["jobTitle"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.location = source["location"];
	        this.linkedin = source["linkedin"];
	        this.github = source["github"];
	        this.website = source["website"];
	        this.summary = source["summary"];
	        this.photoPath = source["photoPath"];
	        this.photoSize = source["photoSize"];
	        this.sourceCvId = source["sourceCvId"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.sections = this.convertValues(source["sections"], Section);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateCVRequest {
	    Title: string;
	    Language: string;
	    FullName: string;
	    Email: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateCVRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Title = source["Title"];
	        this.Language = source["Language"];
	        this.FullName = source["FullName"];
	        this.Email = source["Email"];
	    }
	}
	export class CreateEntryRequest {
	    SectionID: string;
	    OrderKey: string;
	    Title: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateEntryRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SectionID = source["SectionID"];
	        this.OrderKey = source["OrderKey"];
	        this.Title = source["Title"];
	    }
	}
	export class CreateSectionRequest {
	    CVID: string;
	    SectionType: string;
	    Title: string;
	    OrderKey: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateSectionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CVID = source["CVID"];
	        this.SectionType = source["SectionType"];
	        this.Title = source["Title"];
	        this.OrderKey = source["OrderKey"];
	    }
	}
	

}

export namespace translate {
	
	export class TranslateRequest {
	    SourceLanguage: string;
	    TargetLanguage: string;
	    FieldType: string;
	    Text: string;
	
	    static createFrom(source: any = {}) {
	        return new TranslateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SourceLanguage = source["SourceLanguage"];
	        this.TargetLanguage = source["TargetLanguage"];
	        this.FieldType = source["FieldType"];
	        this.Text = source["Text"];
	    }
	}
	export class TranslateResponse {
	    translatedText: string;
	    note: string;
	
	    static createFrom(source: any = {}) {
	        return new TranslateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.translatedText = source["translatedText"];
	        this.note = source["note"];
	    }
	}

}


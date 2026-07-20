import {deleteData, getData, patchData, postData} from "../services/http";

export type UtilityNote = {
    id: number;
    user_id: number;
    note: string;
    created_at: string;
    updated_at: string;
};

export type UtilityNotesResponse = {
    status: "success";
    utilityNotes: UtilityNote[];
};

export type UtilityNoteDetailResponse = {
    status: "success";
    message: string;
    utilityNote: UtilityNote;
};

export type UtilityNotePayload = {
    note: string;
};

export type UtilityNoteErrorResponse = {
    status: "error";
    message: string;
    errors?: Record<string, Record<string, string>>;
};

const NOTES_ENDPOINT = "/api/utility-notes";

//get
export async function getUtilityNotesApi():
    Promise<UtilityNotesResponse> {

    return await getData<UtilityNotesResponse>(
        NOTES_ENDPOINT,
    );
}

//post
export async function createUtilityNoteApi(
    payload: UtilityNotePayload,
): Promise<UtilityNoteDetailResponse> {

    return await postData<
        UtilityNoteDetailResponse,
        UtilityNotePayload
    >(
        NOTES_ENDPOINT,
        payload,
    );
}

//patch
export async function updateUtilityNoteApi(
    id: number,
    payload: UtilityNotePayload,
): Promise<UtilityNoteDetailResponse> {

    return await patchData<
        UtilityNoteDetailResponse,
        UtilityNotePayload
    >(
        NOTES_ENDPOINT + "/" + id,
        payload,
    );
}

//delete
export async function deleteUtilityNoteApi(
    id: number,
): Promise<{
    status: "success";
    message: string;
}> {

    return await deleteData<{
        status: "success";
        message: string;
    }>(
        NOTES_ENDPOINT + "/" + id,
    );
}
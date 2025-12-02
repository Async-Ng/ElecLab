/**
 * Material Request Components - Unified Module
 *
 * This module now contains only the CreateMaterialRequestFromTimetable component
 * which has been refactored to use the unified request system.
 *
 * For creating requests, use components from the request module:
 * - UnifiedRequestModal: Single modal for all request types
 * - GeneralRequestForm: For document/room/timetable requests
 * - MaterialRequestForm: For material allocation/repair requests
 *
 * For viewing requests, use:
 * - MyRequestsList: User's unified request list with tabs
 */

export { CreateMaterialRequestFromTimetable } from "./CreateMaterialRequestFromTimetable";

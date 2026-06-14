// src/types/index.ts

import type { Role, Specialty, BadgeType } from "@prisma/client";

// ─── Auth ──────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
}

// ─── Doctor ────────────────────────────────────

export interface DoctorListItem {
  id: string;
  name: string;
  specialty: Specialty | null;
  location: string | null;
  trustScore: number;
  yearsExp: number | null;
  isVerified: boolean;
  casesCount: number;
  endorsementCount: number;
  image: string | null;
}

export interface DoctorProfile extends DoctorListItem {
  bio: string | null;
  syndicateId: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  folders: FolderWithCount[];
  cases: CaseSummary[];
}

// ─── Case ──────────────────────────────────────

export interface CaseSummary {
  id: string;
  titleAr: string;
  titleEn: string;
  folderId: string | null;
  views: number;
  endorsementCount: number;
  createdAt: string;
  beforeBgColor: string | null;
  afterBgColor: string | null;
}

export interface CaseFull extends CaseSummary {
  challengeAr: string;
  challengeEn: string;
  actionAr: string;
  actionEn: string;
  outcomeAr: string;
  outcomeEn: string;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  beforeLabelAr: string | null;
  beforeLabelEn: string | null;
  afterLabelAr: string | null;
  afterLabelEn: string | null;
  complianceAccepted: boolean;
  doctor: {
    id: string;
    name: string;
    specialty: Specialty | null;
    isVerified: boolean;
    image: string | null;
  };
  endorsements: EndorsementItem[];
}

// ─── Folder ────────────────────────────────────

export interface FolderWithCount {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  _count: { cases: number };
}

// ─── Endorsement ───────────────────────────────

export interface EndorsementItem {
  id: string;
  badgeType: BadgeType;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

// ─── API Payloads ──────────────────────────────

export interface CreateCasePayload {
  titleAr: string;
  titleEn: string;
  challengeAr: string;
  challengeEn: string;
  actionAr: string;
  actionEn: string;
  outcomeAr: string;
  outcomeEn: string;
  folderId?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeLabelAr?: string;
  beforeLabelEn?: string;
  afterLabelAr?: string;
  afterLabelEn?: string;
  beforeBgColor?: string;
  afterBgColor?: string;
  complianceAccepted: boolean;
}

export interface UpdateDoctorPayload {
  name?: string;
  bio?: string;
  location?: string;
  specialty?: Specialty;
  yearsExp?: number;
  whatsappUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
}

export interface EndorsePayload {
  caseId: string;
  receiverId: string;
  badgeType: BadgeType;
}

// ─── i18n ─────────────────────────────────────

export type Lang = "ar" | "en";
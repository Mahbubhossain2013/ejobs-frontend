"use client";

import { Field, TextInput, FileUpload } from "../shared";
import type { ProfileState } from "../types";

export default function VerificationStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <FileUpload label="Trade License" file={s.tradeLicenseFile} setFile={s.setTradeLicenseFile} existingPath={s.tradeLicensePath} />
      <FileUpload label="NID" file={s.nidFile} setFile={s.setNidFile} existingPath={s.nidPath} />
      <FileUpload label="Registration Certificate" file={s.regCertFile} setFile={s.setRegCertFile} existingPath={s.regCertPath} />
      <Field label="TIN Number"><TextInput value={s.tinNumber} onChange={s.setTinNumber} /></Field>
    </div>
  );
}
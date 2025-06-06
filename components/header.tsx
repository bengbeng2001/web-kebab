import { hasEnvVars } from "@/lib/utils";
import { Link } from "lucide-react";
import { EnvVarWarning } from "./env-var-warning";
import { AuthButton } from "./auth-button";

export function HeaderSection() {
    return (
        <div className="w-full max-w-5xl flex justify-between items-center p-3 pl-8 text-sm">
            <Link href={"/"} className="font-semibold">KEBAB SAYANK</Link>
            <div className="flex items-center gap-5">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/menu"}>Menu</Link>
                    <Link href={"/about"}>Tentang Kami</Link>
                    <Link href={"/order"}>Pesan Sekarang!!!</Link>
                    <Link href={"/location"}>Lokasi Kami</Link>
                </div>
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
        </div>
    );
}

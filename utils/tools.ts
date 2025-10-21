export const hideEmail = (email: string): string => {
    if (!email || !email.includes("@")) return email; // basic validation

    const [localPart, domainPart] = email.split("@");
    const [domainName, domainExt] = domainPart.split(".");

    // Always show the first letter of the local part
    const visibleLocal = localPart[0] || "";
    const hiddenLocal = "*".repeat(Math.max(localPart.length - 1, 3));

    // Show domain name but hide middle
    const visibleDomain =
        domainName.length <= 2
            ? domainName[0] + "*"
            : domainName[0] + "*".repeat(domainName.length - 2) + domainName.slice(-1);

    return `${visibleLocal}${hiddenLocal}@${visibleDomain}.${domainExt}`;
};

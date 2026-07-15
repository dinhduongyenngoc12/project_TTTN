type NumericValue = string | number;

function toFiniteNumber(
    value: NumericValue,
): number | null {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
        ? numberValue
        : null;
}

export function formatPrice(
    price: NumericValue,
): string {
    const numberValue = toFiniteNumber(price);

    if (numberValue === null) {
        return "--";
    }

    return (
        new Intl.NumberFormat("vi-VN").format(numberValue) +
        " đ/kWh"
    );
}

export function formatTierRange(
    fromKwh: NumericValue,
    toKwh: NumericValue | null,
): string {
    const fromValue = toFiniteNumber(fromKwh);

    if (fromValue === null) {
        return "--";
    }

    if (toKwh === null) {
        return (
            new Intl.NumberFormat("vi-VN").format(fromValue) +
            "+ kWh"
        );
    }

    const toValue = toFiniteNumber(toKwh);

    if (toValue === null) {
        return "--";
    }

    return (
        new Intl.NumberFormat("vi-VN").format(fromValue) +
        " - " +
        new Intl.NumberFormat("vi-VN").format(toValue) +
        " kWh"
    );
}

export function formatDate(
    date: string,
): string {
    if (!date) {
        return "--";
    }

    const parsedDate = new Date(date + "T00:00:00");

    if (!Number.isFinite(parsedDate.getTime())) {
        return "--";
    }

    return parsedDate.toLocaleDateString("vi-VN");
}
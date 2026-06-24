package com.example.bmi.util;

/**
 * Stateless utility for BMI arithmetic.
 * Keeping the formula in one place ensures every service
 * uses the same rounding scale (2 decimal places).
 */
public final class BmiCalculator {

    private static final double ROUNDING_SCALE = 100.0;
    private static final double CM_PER_METER   = 100.0;

    private BmiCalculator() {}

    /** Returns BMI rounded to 2 decimal places. */
    public static double compute(double heightCm, double weightKg) {
        double heightMetres = heightCm / CM_PER_METER;
        double rawBmi       = weightKg / (heightMetres * heightMetres);
        return Math.round(rawBmi * ROUNDING_SCALE) / ROUNDING_SCALE;
    }
}

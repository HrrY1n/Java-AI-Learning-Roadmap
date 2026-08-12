package com.javaroadmap.stage03.student;

/** 学生实体类。 */
public class Student {
    private int id;
    private String name;
    private int score;

    public Student(int id, String name, int score) {
        this.id = id;
        this.name = name;
        this.score = score;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    public String toCsvLine() {
        return id + "," + name + "," + score;
    }

    public static Student fromCsvLine(String line) {
        String[] parts = line.split(",");
        int id = Integer.parseInt(parts[0]);
        String name = parts[1];
        int score = Integer.parseInt(parts[2]);
        return new Student(id, name, score);
    }

    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "', score=" + score + "}";
    }
}


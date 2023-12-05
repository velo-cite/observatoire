<?php

namespace App\DataFixtures;

use App\Entity\LigneReVE;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ReVEFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 14; $i++) {
            $ligne = new LigneReVE();
            $ligne->setName('Numéro '.$i);
            $ligne->setNumero($i);
            $manager->persist($ligne);
        }

        $manager->flush();
    }
}

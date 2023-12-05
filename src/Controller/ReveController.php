<?php

namespace App\Controller;

use App\Entity\LigneReVE;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/reve')]

class ReveController extends AbstractController
{
    #[Route('/ligne/{id}', name: 'app_reve_ligne')]
    public function ligne(LigneReVE $ligneReVE): Response
    {
        return $this->render('reve/ligne.html.twig', [
            'ligneReve' => $ligneReVE,
        ]);
    }
}
